function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
}

async function GET(url) {
    const response = await fetch(`/ajax/${url}`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const data = await response.json();
    return data.data;
}

function POST(url, data) {
    fetch(`/ajax/${url}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
}

function checkForRowErrors(year, semester) {

    // Check if adding class made it more than 4 per semester
    selectedInRow = document.querySelectorAll(`td[data-year="${year}"][data-semester="${semester}"].sel.selected`)
    if (selectedInRow.length > 4)
        // Mark red
        selectedInRow.forEach((cell) => {
            cell.classList.add('row-error')
        })
    else
        // Remove safe cells from error class
        selectedInRow.forEach((cell) => {
            // Mark safe if cell is error free in all ways
            cell.classList.remove('row-error')
        })    
}

function checkForColumnError(index) {

    // Check if adding class made it more than 1 per course
    selectedInColumn = document.querySelectorAll(`td[data-column="${index}"].sel.selected`)
    if (selectedInColumn.length > 1)
        selectedInColumn.forEach((cell) => {
            cell.classList.add('column-error')
        })
    else
        // Remove safe cells from error class
        selectedInColumn.forEach((cell) => {
            cell.classList.remove('column-error')
        })    
}

window.addEventListener('load', async () => {

    /*
        ADD SELECTED CELLS CLASS AT BEGINNING
    */
    let columns = new Set()
    let rows = []
    for (course of await GET("getselections")) {
        const STRING = `td[data-column="${course.column}"][data-year="${course.year}"][data-semester="${course.semester}"].sel`
        cell = document.querySelectorAll(STRING).item(0)?.classList.add('selected')

        // Add column and row to arrays
        columns.add(course.column)
        rows.push([course.year, course.semester])
    }

    /*
        ADD ERROR MARKINGS
    */
    for (c of [...columns])
        checkForColumnError(c)
    for (r of Array.from(new Set(rows.map(JSON.stringify)), JSON.parse))
        checkForRowErrors(r[0], r[1])

    /*
        SELECTION AND DESELECTION OF CELLS
    */
    const selectableCells = document.querySelectorAll("td.sel")
    
    selectableCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            if (cell.classList.contains('selected')) {
                // Send course deletion
                POST("removecourse", {
                    "column": cell.dataset.column,
                    "year": parseInt(cell.dataset.year),
                    "semester": cell.dataset.semester
                })
                cell.classList.remove('selected')

            } else {
                // Send course addition
                POST("addcourse", {
                    "column": cell.dataset.column,
                    "year": parseInt(cell.dataset.year),
                    "semester": cell.dataset.semester
                })
                cell.classList.add('selected')
            }

            // Check for errors
            checkForRowErrors(parseInt(cell.dataset.year), cell.dataset.semester)
            checkForColumnError(cell.dataset.column)

        })
    })

    /*
        HIDING AND SHOWING OF COLUMNS
    */
    const selectableGroups = document.querySelectorAll("th")

    selectableGroups.forEach(group => {
        group.addEventListener('click', async (e) => {
            // Get data from selected group
            const groupData = (await GET(`getgroups?col=${group.dataset.column}&row=${group.dataset.row}`))[0]

            // Shrink super group down
            const superGroupData = await GET(`getsupergroup?col=${group.dataset.column}&row=${group.dataset.row}`)
            const superGroup = document.querySelector(`th[data-column="${superGroupData.column}"][data-row="${superGroupData.row}"]`)

            superGroup.colSpan -= group.colSpan - 1
            console.log(superGroup)

            // Make the group cell smaller but tall
            group.colSpan = "1"
            group.rowSpan = 5 - group.dataset.row
            group.classList.add('hidden')

            for (i = groupData.column; i < groupData.column + groupData.count; i++) {
                // Delete the original course code cells
                document.querySelector(`.col${i}`).remove()

                // Delete all subgroups
                for (j = parseInt(group.dataset.row) + 1; j < 6; j++) {
                    document.querySelectorAll(`th[data-column="${i}"][data-row="${j}"]`).forEach((cell) => {
                        cell.remove()
                    })
                }

                // Delete blank spaces
                document.querySelectorAll(`td[data-column="${i}"]:not([data-row="${group.dataset.row}"]):not(.sel):empty`).forEach((cell) => {
                    cell.remove()
                })

                if (i > groupData.column) {
                    // Delete all selectable columns except first
                    document.querySelectorAll(`td[data-column="${i}"].sel`).forEach((cell) => {
                        cell.remove()
                    })
                }
            }

            // Set number and color for each semester
            for (year in groupData.selected_per_semester)
                for (semester in groupData.selected_per_semester[year]) {
                    // Number and color if more than 0
                    if (groupData.selected_per_semester[year][semester] > 0) {
                        cell = document.querySelector(`td[data-column="${groupData.column}"][data-year="${year - 1}"][data-semester="${semester}"]`)
                        
                        cell.innerHTML = groupData.selected_per_semester[year][semester]
                        cell.classList.add('selected')
                        
                    }
                }
        })
    })
})