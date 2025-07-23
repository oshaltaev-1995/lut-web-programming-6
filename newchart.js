const selectedCode = sessionStorage.getItem("selectedCode") || "SSS";

async function fetchBirthDeathData(code) {
    const body = {
        query: [
            {
                code: "Vuosi",
                selection: {
                    filter: "item",
                    values: [...Array(22).keys()].map(i => (2000 + i).toString())
                }
            },
            {
                code: "Alue",
                selection: {
                    filter: "item",
                    values: [code]
                }
            },
            {
                code: "Tiedot",
                selection: {
                    filter: "item",
                    values: ["vm01", "vm11"]
                }
            }
        ],
        response: { format: "json-stat2" }
    };

    const res = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const result = await res.json();
    const [births, deaths] = [result.value.slice(0, 22), result.value.slice(22)];

    const years = [...Array(22).keys()].map(i => (2000 + i).toString());
    new frappe.Chart("#chart", {
        title: "Births and Deaths",
        type: 'bar',
        height: 450,
        data: {
            labels: years,
            datasets: [
                {
                    name: "Births",
                    values: births,
                    chartType: 'bar',
                    color: '#63d0ff'
                },
                {
                    name: "Deaths",
                    values: deaths,
                    chartType: 'bar',
                    color: '#363636'
                }
            ]
        },
        colors: ['#63d0ff', '#363636']
    });
}

window.addEventListener("DOMContentLoaded", () => {
    fetchBirthDeathData(selectedCode);
});
