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

window.addEventListener('load', async () => {

    /*
        ADD SELECTED CELLS CLASS AT BEGINNING
    */
    for (course of await GET("getselections"))
        cell = document.querySelectorAll(`td[data-column="${course.column}"][data-year="${course.year}"][data-semester="${course.semester}"]`).item(0)?.classList.add('selected')

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

        })
    })


    // Hiding columns
    /*document.getElementById('bb8').addEventListener('click', (e) => {
        document.querySelectorAll("td:nth-child(5), th:nth-child(5)").forEach((item) => {
            item.style.display = 'none'
        })
    })*/
})