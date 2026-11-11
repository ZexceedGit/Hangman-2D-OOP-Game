// this is only a placeholder endpoints
export const data = async function fetch_backend(backend_api){
    try {
    const response = await fetch(backend_api);
    if(!response.ok) {
        console.error("HTTP Request Unavalialbe", error);
        return
    };
    const data = await response.json();
    const needData = data.slice(0,10); // this gets 10 out of total object
     }
     catch(error){
        console.log("Something Wrong happened!", e)
     }
}

const dataArray = []
for(let i = 0; i >= data.length; i++){
    dataArray.append(data[i]);
    return
}

fetch_backend("backendApiPlaceholder");