let chart;
let populationData = [];
let municipalityCodes = {};
let selectedCode = "SSS";

async function getMunicipalityCodes() {
    const res = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px");
    const data = await res.json();
    const codes = data.variables[1].values;
    const names = data.variables[1].valueTexts;
    codes.forEach((code, i) => municipalityCodes[names[i].toLowerCase()] = code);
}

async function fetchPopulationData(code) {
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
                    values: ["vaesto"]
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
    const values = result.value;
    populationData = values;
    sessionStorage.setItem("selectedCode", code);
    drawChart(values);
}

function drawChart(values) {
    const years = [...Array(22).keys()].map(i => (2000 + i).toString());
    if (chart) chart.destroy();
    chart = new frappe.Chart("#chart", {
        title: "Population Growth",
        type: 'line',
        height: 450,
        data: {
            labels: years,
            datasets: [
                {
                    name: "Population",
                    type: "line",
                    values: values,
                    chartType: "line",
                    color: '#eb5146'
                }
            ]
        },
        colors: ['#eb5146']
    });
}

function predictNext() {
    if (populationData.length < 2) return;
    let deltas = [];
    for (let i = 1; i < populationData.length; i++) {
        deltas.push(populationData[i] - populationData[i - 1]);
    }
    const meanDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const predicted = Math.round(populationData[populationData.length - 1] + meanDelta);
    populationData.push(predicted);
    drawChart(populationData);
}

document.getElementById("submit-data").addEventListener("click", () => {
    const name = document.getElementById("input-area").value.toLowerCase();
    const code = municipalityCodes[name];
    if (code) {
        selectedCode = code;
        fetchPopulationData(code);
    } else {
        alert("Municipality not found");
    }
});

document.getElementById("add-data").addEventListener("click", predictNext);

window.addEventListener("DOMContentLoaded", async () => {
    await getMunicipalityCodes();
    fetchPopulationData("SSS");
});
