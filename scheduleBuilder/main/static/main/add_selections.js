import { GET } from './ajax.js'
import { checkForColumnError, checkForRowErrors } from './check_errors.js'

export async function add_selections() {
    let columns = new Set()
    let rows = []
    for (const course of await GET("getselections")) {
        const STRING = `td[data-column="${course.column}"][data-year="${course.year}"][data-semester="${course.semester}"].sel`
        const cell = document.querySelectorAll(STRING).item(0)?.classList.add('selected')

        // Add column and row to arrays
        columns.add(course.column)
        rows.push([course.year, course.semester])
    }

    // Add error marking
    for (const c of [...columns])
        checkForColumnError(c)
    for (const r of Array.from(new Set(rows.map(JSON.stringify)), JSON.parse))
        checkForRowErrors(r[0], r[1])
}