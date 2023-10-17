import { GET } from './ajax.js'

// Shrink or grow super groups
async function changeSuperGroups(superGroupData, count, shrink) {
    if (!superGroupData) return

    const superGroup = document.querySelector(`th[data-pk="${superGroupData.pk}"]`)
    if (shrink)
        superGroup.colSpan -= count - 1
    else
        superGroup.colSpan += count - 1
    changeSuperGroups(await GET(`getsupergroup?pk=${superGroupData.pk}`), count, shrink)
}

// Hides a certain column
async function hideColumn(pk) {
    // Get data
    const group = document.querySelector(`th[data-pk="${pk}"]`)
    const groupData = (await GET(`getselectionsbygroup?pk=${pk}`))[0]
    const subgroups = await GET(`getsubgroups?pk=${pk}`)
                
    // Unhide any hidden subgroups
    for (const subgroup of subgroups)
        if (document.querySelector(`th[data-pk="${subgroup.pk}"].hidden`))
           await unhideColumn(subgroup.pk)

    // Shrink all super group down
    changeSuperGroups(await GET(`getsupergroup?pk=${pk}`), group.colSpan, true)

    // Make the group cell smaller but tall
    group.colSpan = "1"
    group.rowSpan = 5 - groupData.row
    group.classList.add('hidden')

    // Hide all subgroups
    for (const o of subgroups) {
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
                const cell = document.querySelector(`td[data-column="${groupData.column}"][data-year="${year}"][data-semester="${semester}"]`)
                
                cell.innerHTML = groupData.selected_per_semester[year][semester]
                cell.classList.add('selected')
                
            }
        }
}

// Unhides a certain column
async function unhideColumn(pk) {

    // Get data
    const group = document.querySelector(`th[data-pk="${pk}"]`)
    const groupData = (await GET(`getselectionsbygroup?pk=${pk}`))[0]

    // Make the group cell expand again
    const IS_LAST = (await GET(`getgroups?pk=${group.dataset.pk}`))[0].is_last
    group.colSpan = groupData.count
    group.rowSpan = IS_LAST ? 5 - groupData.row - 1 : 1
    group.classList.remove('hidden')

    // Expand all super groups
    changeSuperGroups(await GET(`getsupergroup?pk=${pk}`), group.colSpan, false)

    // Grab all the cells that were originally hidden and make them appear again
    document.querySelectorAll(`[data-hidden="${groupData.pk}"]`).forEach((cell) => {
        delete cell.dataset.hidden
    })

    // Remove hidden class from first row
    document.querySelectorAll(`td[data-column="${groupData.column}"].sel`).forEach((cell) => {
    cell.classList.remove('hidden')
    })

    // Reset first row number and color for each semester
    const firstRowSelections = await GET(`getselections?course__column=${groupData.column}`)

    for (const year in groupData.selected_per_semester)
    for (const semester in groupData.selected_per_semester[year]) {

        // Switch back to original
        const cell = document.querySelector(`td[data-column="${groupData.column}"][data-year="${year}"][data-semester="${semester}"]`)
        if (firstRowSelections.some((o) => o.semester == semester && o.year == year))
            cell.classList.add('selected')
        else
            cell.classList.remove('selected')
        cell.innerHTML = ""
    }
}


export async function hideColumns() {
    const selectableGroups = document.querySelectorAll("th")

    selectableGroups.forEach(group => {
        group.addEventListener('click', async (e) => {

            if (group.classList.contains('hidden')) {
                unhideColumn(group.dataset.pk)
            
            } else {
                hideColumn(group.dataset.pk)
            }
        })
    })
}