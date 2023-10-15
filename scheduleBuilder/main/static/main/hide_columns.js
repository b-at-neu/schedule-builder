import { GET } from './ajax.js'

export async function hideColumns() {
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

                for (let i = groupData.column; i < groupData.column + groupData.count; i++) {
                    // Delete the original course code cells
                    document.querySelector(`.col${i}`).remove()

                    // Delete all subgroups
                    for (let j = parseInt(group.dataset.row) + 1; j < 6; j++) {
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
                for (const year in groupData.selected_per_semester)
                    for (const semester in groupData.selected_per_semester[year]) {
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
}