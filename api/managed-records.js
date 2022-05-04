import fetch from "../util/fetch-fill";
import URI from "urijs";
import axios from "axios";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

const isPrimaryColor = (color) => {
    const primaryColors = ["red", "blue", "yellow"];
    return Boolean(primaryColors.find(c => color === c));
}

const transformRecords = (records, page) => {
    const result = {};
    result.ids = [];
    result.open = [];

    const primaryColors = ["red", "blue", "yellow"];
    result.closedPrimaryCount = 0;

    if (page > 50) {
        result.previousPage = 50;
        result.nextPage = null;
        return result;
    }

    if (records.length === 0) {
        result.previousPage = null;
        result.nextPage = null;
        return result;
    }

    records.forEach(record => {
        result.ids.push(record.id);

        let isPrimary = isPrimaryColor(record.color);

        if (record.disposition === "open") {
            const recordCopy = Object.assign(record);
            recordCopy.isPrimary = isPrimary;
            result.open.push(recordCopy);
        } else if (record.disposition === "closed" && isPrimary) {
            result.closedPrimaryCount++;
        }
    })

    let previousPage = null;
    if (page > 1) {
        previousPage = page - 1;
    }
    result.previousPage = previousPage;

    let nextPage = null;
    if (page < 50) {
        nextPage = page + 1;
    }
    result.nextPage = nextPage;

    return result;
}

const retrieve = (options = {}) => {
    const itemsPerPage = 10;

    let offset = 0;
    let page = 1;
    if (options.page) {
        page = options.page;
        offset = (options.page - 1) * 10; 
    }

    let colors = ["red", "brown", "blue", "yellow", "green"];
    if (options.colors) {
        colors = options.colors;
    }

    // not using URI library, why use it when we can just include object? Discuss
    // const uri = URI("http://localhost:3000/records")
    //     .search({ limit: "10", offset, "color[]": colors });

    return axios.get(window.path, {
        params: {
            limit: "10", 
            offset, 
            "color[]": colors 
            }
        })
        .then(res => {
            return transformRecords(res.data, page)
        })
        .catch(err => console.log(`API request is unsuccessful.`));
    }

export default retrieve;