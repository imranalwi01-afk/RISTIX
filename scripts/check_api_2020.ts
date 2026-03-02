async function main() {
    try {
        const res = await fetch('http://localhost:4232/api/v1/ifrs9/reports/ead-model/summary?prc_date=2020-12-31');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));

        const res2 = await fetch('http://localhost:4232/api/v1/ifrs9/reports/ead-model?prc_date=2020-12-31');
        const data2 = await res2.json();
        console.log("EAD Model Pivot Data count:", data2.data?.length);
    } catch(e) {
        console.error(e);
    }
}
main();
