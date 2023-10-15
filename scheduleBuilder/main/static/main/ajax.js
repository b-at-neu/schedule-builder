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

export async function GET(url) {
    const response = await fetch(`/ajax/${url}`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const data = await response.json();
    return data.data;
}

export function POST(url, data) {
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