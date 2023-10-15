import { checkForColumnError, checkForGroupError, checkForRowErrors } from './check_errors.js'
import { POST } from './ajax.js'

export function select_cells() {
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
            checkForGroupError(cell.dataset.column)
        })
    })
}