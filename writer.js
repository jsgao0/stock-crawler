const createCsvWriter = require('csv-writer').createArrayCsvWriter;

module.exports = {
  save: async (filename, titles, records) => {
    const csvWriter = createCsvWriter({
      header: titles,
      path: `./${filename}`
    });

    return await csvWriter.writeRecords(records);
  }
}