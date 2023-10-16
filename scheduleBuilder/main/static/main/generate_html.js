import { GET } from './ajax.js'

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
        
    // Add empty cells
    for (const row of titleRows)
        row.append(document.createElement("td"), document.createElement("td"))
            
    // Add all groups
    for (const group of await GET("getgroups")) {
        
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

    // Add row and empty cells
    const courseRow = table.appendChild(document.createElement("tr"))
    courseRow.append(document.createElement("td"), document.createElement("td"))

    // Add all courses
    for (const course of await GET("getcourses")) {
        const td = document.createElement("td")
        td.classList.add(`col${course.index}`)
        td.innerHTML = course.code
        courseRow.append(td)
    }

    // Add rest of the table
    const info = await GET('getsetupinfo')

    for (let i = 1; i <= info.year_count; i++) {
        let row = document.createElement("tr")

        // Add year
        const tdYear = document.createElement("td")
        tdYear.rowSpan = info.semesters.length
        tdYear.innerHTML = `YEAR ${i}`
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

            // Add selectable cells
            for (let j = 0; j < info.course_count; j++) {
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
}