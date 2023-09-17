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

function GET(url) {
    return fetch(`/ajax/${url}`, {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      .then(response => response.json())
      .then(data => data.data )
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


    // Hiding columns
    /*document.getElementById('bb8').addEventListener('click', (e) => {
        document.querySelectorAll("td:nth-child(5), th:nth-child(5)").forEach((item) => {
            item.style.display = 'none'
        })
    })*/
})