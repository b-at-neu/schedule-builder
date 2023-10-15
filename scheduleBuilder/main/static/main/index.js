import { generate } from './generate_html.js'
import { add_selections } from './add_selections.js'
import { select_cells } from './select_cells.js'
import { hideColumns } from './hide_columns.js'
import { clearAll } from './clear_all.js'

window.addEventListener('load', async () => {

    // GENERATE HTML
    await generate()

    // ADD SELECTED CELLS
    await add_selections()

    // SELECTION AND DESELECTION OF CELLS
    select_cells()

    // HIDING AND SHOWING OF COLUMNS
    await hideColumns()

    // CLEAR ALL SELECTIONS BUTTON
    document.getElementById('clear-all').onclick = clearAll
})