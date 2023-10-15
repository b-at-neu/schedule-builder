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
    row = document.querySelectorAll(`td[data-year="${year}"][data-semester="${semester}"].sel`)

    // Add the total count of selected including hidden
    let count = 0
    document.querySelectorAll(`td[data-year="${year}"][data-semester="${semester}"].sel.selected`).forEach((cell) => {
        if (cell.innerHTML)
            count += parseInt(cell.innerHTML)
        else
            count++
    })

    if (count > 4)
        // Mark entire row red
        row.forEach((cell) => {
            cell.classList.add('row-error')
        })
    else
        // Remove safe cells from error class
        row.forEach((cell) => {
            // Mark safe if cell is error free in all ways
            cell.classList.remove('row-error')
        })    
}

function checkForColumnError(index) {

    // Check if adding class made it more than 1 per course
    column = document.querySelectorAll(`td[data-column="${index}"].sel`)
    if (document.querySelectorAll(`td[data-column="${index}"].sel.selected`).length > 1)
        column.forEach((cell) => {
            cell.classList.add('column-error')
        })
    else
        // Remove safe cells from error class
        column.forEach((cell) => {
            cell.classList.remove('column-error')
        })    
}

window.addEventListener('load', async () => {

    /*
        GENERATE HTML
    */
    const table = document.getElementById("table")

    // Handle title groups
    const titleRows = [
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
    ]
    const titleIndeces = [0, 0, 0, 0]
        
    // Add empty cells
    for (row of titleRows)
        row.append(document.createElement("td"), document.createElement("td"))
            
    // Add all groups
    for (group of await GET("getgroups")) {
        
        // Throw error incase
        if (group.index < titleIndeces[group.row])
            throw new Error("Group index may not be lower than current index")
        // Add blank cells as long as necessary
        while (group.index > titleIndeces[group.row]) {
            const td = document.createElement("td")
            td.dataset.column = titleIndeces[group.row]
            td.dataset.row = group.row
            titleRows[group.row].append(td)
            titleIndeces[group.row]++
        }

        // Calculate added index due to rowspan
        if (group.is_last)
            for (j = group.row + 1; j < 4; j++)
                titleIndeces[j] += group.count

        // Create title cell
        const title = document.createElement("th")
        title.title = "Click to hide this group"
        title.classList.add(`row${group.row}`)
        title.colSpan = group.count
        title.rowSpan = group.is_last ? 5 - group.row - 1 : 1
        title.dataset.column = group.index
        title.dataset.row = group.row
        title.innerHTML = group.title + (group.count ? `(choose ${group.required})` : "")
        titleRows[group.row].append(title)

        // Increment index
        titleIndeces[group.row] += group.count
    }

    // Add row and empty cells
    const courseRow = table.appendChild(document.createElement("tr"))
    courseRow.append(document.createElement("td"), document.createElement("td"))

    // Add all courses
    for (course of await GET("getcourses")) {
        const td = document.createElement("td")
        td.classList.add(`col${course.index}`)
        td.innerHTML = course.code
        courseRow.append(td)
    }

    // Add rest of the table
    const info = await GET('getsetupinfo')

    for (i = 1; i <= info.year_count; i++) {
        let row = document.createElement("tr")

        // Add year
        const tdYear = document.createElement("td")
        tdYear.rowSpan = info.semesters.length
        tdYear.innerHTML = `YEAR ${i}`
        table.appendChild(row.appendChild(tdYear))

        // Add semesters
        for (semester of info.semesters) {
            // Bypass new row on first iteration
            if (semester != info.semesters[0]) {
                row = document.createElement("tr")
                table.append(row)
            }

            const tdSemester = row.appendChild(document.createElement("td"))
            tdSemester.innerHTML = semester

            // Add selectable cells
            for (j = 0; j < info.course_count; j++) {
                const tdSelectable = document.createElement("td")
                tdSelectable.classList.add("sel")
                tdSelectable.title = "Click to select this course"
                tdSelectable.dataset.column = j
                tdSelectable.dataset.year = i
                tdSelectable.dataset.semester = semester
                row.append(tdSelectable)
            }
        }
    }

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
            // Check if the cell is hidden
            if (cell.classList.contains('hidden'))
                return

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
            const groupData = (await GET(`getselectionsbygroup?index=${group.dataset.column}&row=${group.dataset.row}`))[0]

            // Get supergroup
            const superGroupData = await GET(`getsupergroup?index=${group.dataset.column}&row=${group.dataset.row}`)
            const superGroup = document.querySelector(`th[data-column="${superGroupData.column}"][data-row="${superGroupData.row}"]`)

            if (group.classList.contains('hidden')) {
                // UNHIDE
                

                // Expand super group
                superGroup.colSpan += group.colSpan - 1

                // Make the group cell expand again
                IS_LAST = true /////// FIX ---------------------
                group.colSpan = groupData.count
                group.rowSpan = IS_LAST ? 1 : 5 - group.dataset.row - 1
                group.classList.remove('hidden')

                // Perhaps just make request for backend to generate html again?
                
                // Instead of deleting the original cells, maybe make them width 0?
                console.log("rarar")
            
            } else {
            // HIDE

                // Shrink super group down
                superGroup.colSpan -= group.colSpan - 1

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

                    // Delete all selectable columns except first
                    if (i > groupData.column) {
                        document.querySelectorAll(`td[data-column="${i}"].sel`).forEach((cell) => {
                            cell.remove()
                        })
                    
                    // Add hidden class to first column
                    } else {
                        document.querySelectorAll(`td[data-column="${i}"].sel`).forEach((cell) => {
                            cell.classList.add('hidden')
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
            }
        })
    })
})