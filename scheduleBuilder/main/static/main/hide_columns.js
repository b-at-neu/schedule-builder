import { GET } from './ajax.js'

export async function hideColumns() {
    const selectableGroups = document.querySelectorAll("th")

    selectableGroups.forEach(group => {
        group.addEventListener('click', async (e) => {

            // Get data from selected group
            const groupData = (await GET(`getselectionsbygroup?pk=${group.dataset.pk}`))[0]

            // Get supergroup
            const superGroupData = await GET(`getsupergroup?pk=${group.dataset.pk}`)
            const superGroup = superGroupData ? document.querySelector(`th[data-pk="${superGroupData.pk}"]`) : null

            if (group.classList.contains('hidden')) {
            // UNHIDE

                // Expand super group
                if (superGroup)
                    superGroup.colSpan += group.colSpan

                // Make the group cell expand again
                const IS_LAST = (await GET(`getgroups?pk=${group.dataset.pk}`))[0].is_last
                group.colSpan = groupData.count
                group.rowSpan = IS_LAST ? 5 - groupData.row - 1 : 1
                group.classList.remove('hidden')
                
                // Grab all the cells that were originally hidden and make them appear again
                document.querySelectorAll(`[data-hidden="${groupData.pk}"]`).forEach((cell) => {
                    delete cell.dataset.hidden
                })

                // Remove hidden class from first row
                document.querySelectorAll(`td[data-column="${groupData.column}"].sel`).forEach((cell) => {
                    cell.classList.remove('hidden')
                })

                // Reset first row number and color for each semester
                const firstRowSelections = await GET(`getselections?course__index=${groupData.column}`)

                for (const year in groupData.selected_per_semester)
                    for (const semester in groupData.selected_per_semester[year]) {
                        console.log(groupData.column, year - 1, semester)
                        // Switch back to original
                        const cell = document.querySelector(`td[data-column="${groupData.column}"][data-year="${year}"][data-semester="${semester}"]`)
                        console.log(cell)
                        if (firstRowSelections.some((o) => o.semester == semester && o.year == year))
                            cell.classList.add('selected')
                        else
                            cell.classList.remove('selected')
                        cell.innerHTML = ""
                    }
                
            
            } else {
            // HIDE

                // Shrink super group down
                if (superGroup)
                    superGroup.colSpan -= group.colSpan - 1

                // Make the group cell smaller but tall
                group.colSpan = "1"
                group.rowSpan = 5 - groupData.row
                group.classList.add('hidden')

                // Hide all subgroups
                for (const o of await GET(`getsubgroups?pk=${group.dataset.pk}`)) {
                    document.querySelectorAll(`th[data-pk="${o.pk}"]`).forEach((cell) => {
                        cell.dataset.hidden = groupData.pk
                    })
                }

                for (let i = groupData.column; i < groupData.column + groupData.count; i++) {
                    // Hide the original course code cells
                    document.querySelector(`.col${i}`).dataset.hidden = groupData.pk

                    // Hide blank spaces
                    document.querySelectorAll(`td[data-column="${i}"]:not([data-row="${groupData.row}"]):not(.sel):empty`).forEach((cell) => {
                        cell.dataset.hidden = groupData.pk
                    })

                    // Hide all selectable columns except first
                    if (i > groupData.column) {
                        document.querySelectorAll(`td[data-column="${i}"].sel`).forEach((cell) => {
                            cell.dataset.hidden = groupData.pk
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
                            const cell = document.querySelector(`td[data-column="${groupData.column}"][data-year="${year - 1}"][data-semester="${semester}"]`)
                            
                            cell.innerHTML = groupData.selected_per_semester[year][semester]
                            cell.classList.add('selected')
                            
                        }
                    }
            }
        })
    })
}