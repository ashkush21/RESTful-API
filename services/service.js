const filepath = "./data/store.json";

const readFile = async (fs) => {
  let unparsedAllData, allData;

  try {
    unparsedAllData = await fs.promises.readFile(filepath, "utf8");

    //Handle the error when the JSON file is empty
    if (!unparsedAllData) {
      //Creates and empty json object in the file
      await fs.promises.writeFile(filepath, "{}");
      unparsedAllData = "{}";
    }
    allData = JSON.parse(unparsedAllData);
  } catch (err) {
    throw err;
  }
  return allData;
};

const writeFile = async (fs, input) => {
  try {
    await fs.promises.writeFile(filepath, JSON.stringify(input, null, 2));
  } catch (err) {
    throw err;
  }
};

// export { readFile, writeFile };
module.exports = { readFile, writeFile };
