import { GET } from './ajax.js'
import { hideColumn } from './hide_columns.js'

export async function generate() {
    const table = document.getElementById("table")

    // Handle title groups
    const titleRows = [
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
        table.appendChild(document.createElement("tr")),
    ]
    const titleIndeces = [0, 0, 0, 0]
        
    // Add big empty cell
    const emptyTd = document.createElement("td")
    emptyTd.classList.add("sticky")
    emptyTd.rowSpan = 5
    emptyTd.colSpan = 2
    titleRows[0].append(emptyTd)
            
    // Add all groups
    const allGroups = await GET("getgroups")
    for (const group of allGroups) {
        
        // Throw error incase
        if (group.column < titleIndeces[group.row])
            throw new Error("Group column may not be lower than current column")
        // Add blank cells as long as necessary
        while (group.column > titleIndeces[group.row]) {
            const td = document.createElement("td")
            td.dataset.column = titleIndeces[group.row]
            td.dataset.row = group.row
            titleRows[group.row].append(td)
            titleIndeces[group.row]++
        }

        // Calculate added column due to rowspan
        if (group.is_last)
            for (let j = group.row + 1; j < 4; j++)
                titleIndeces[j] += group.count

        // Create title cell
        const title = document.createElement("th")
        title.title = "Click to hide this group"
        title.classList.add(`row${group.row}`)
        title.colSpan = group.count
        title.rowSpan = group.is_last ? 5 - group.row - 1 : 1
        title.dataset.pk = group.pk
        title.innerHTML = group.title ? `${group.title} (${group.required})` : `(Choose ${group.required})`
        titleRows[group.row].append(title)

        // Increment index
        titleIndeces[group.row] += group.count
    }

    // Add row
    const courseRow = table.appendChild(document.createElement("tr"))

    // Add all courses
    for (const course of await GET("getcourses")) {
        const td = document.createElement("td")
        td.classList.add(`col${course.column}`)
        td.innerHTML = course.code
        courseRow.append(td)
    }

    // Add rest of the table
    const info = await GET('getsetupinfo')

    function addSelectableCells(row, year, semester) {
        // Add selectable cells
        for (let j = 0; j < info.course_count; j++) {
            const tdSelectable = document.createElement("td")
            tdSelectable.classList.add("sel")
            tdSelectable.title = "Click to select this course"
            tdSelectable.dataset.column = j
            tdSelectable.dataset.year = year
            tdSelectable.dataset.semester = semester
            row.append(tdSelectable)
        }
    }

    for (let i = 0; i <= info.year_count; i++) {
        let row = document.createElement("tr")

        // Credit row
        if (i == 0) {
            const tdYear = document.createElement("td")
            tdYear.colSpan = 2
            tdYear.innerHTML = "Credit"
            tdYear.classList.add("sticky")
            row.appendChild(tdYear)
            table.appendChild(row)

            addSelectableCells(row, 0, "Credit")
            
            continue
        }

        // Add year
        const tdYear = document.createElement("td")
        tdYear.rowSpan = info.semesters.length
        tdYear.innerHTML = `YEAR ${i}`
        tdYear.classList.add("sticky")
        row.appendChild(tdYear)
        table.appendChild(row)

        // Add semesters
        for (const semester of info.semesters) {
            // Bypass new row on first iteration
            if (semester != info.semesters[0]) {
                row = document.createElement("tr")
                table.append(row)
            }

            const tdSemester = row.appendChild(document.createElement("td"))
            tdSemester.innerHTML = semester
            tdSemester.classList.add("sticky2")

            addSelectableCells(row, i, semester)
        }
    }

    // Pre-hide columns that should be hidden
    for (const group of allGroups) {
        if (group.hidden)
            hideColumn(group.pk)
    }
}