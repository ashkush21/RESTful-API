const appRouter = (app, fs) => {
  const filepath = "./data/store.json";

  const readFile = async (dataset) => {
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

  const writeFile = async (input) => {
    try {
      await fs.promises.writeFile(filepath, JSON.stringify(input, null, 2));
    } catch (err) {
      throw err;
    }
  };

  app.get("/:entity/:id", async (req, res) => {
    const dataset = req.params.entity;
    const Id = req.params.id;
    let allData, requiredDataset;

    try {
      allData = await readFile(dataset);
      requiredDataset = allData[`${dataset}`];
      //check if corresponding dataset is present or not
      if (requiredDataset) {
        let requiredData = requiredDataset.filter((data) => data.id === Id)[0];

        //check if required data entry is present or not
        if (requiredData) res.send(requiredData);
        else res.send(`${dataset} with Id ${Id} not found`);
      } else {
        res.send(`${dataset} not found in database`);
      }
    } catch (err) {
      console.log(err);
      res.send("Some error occured");
    }
  });

  app.get("/:entity", async (req, res) => {
    const dataset = req.params.entity;

    try {
      allData = await readFile(dataset);
    } catch (err) {
      console.log(err);
      res.send("Some error occured");
    }
    let requiredDataset = allData[`${dataset}`];
    //check if corresponding dataset is present or not
    if (requiredDataset) res.send(requiredDataset);
    else res.send(`${dataset} not found in database`);
  });

  app.post("/:entity", async (req, res) => {
    const dataset = req.params.entity;
    let allData;
    let input = req.body;

    try {
      allData = await readFile(dataset);
    } catch (err) {
      throw err;
    }

    let requiredDataset = allData[`${dataset}`];

    if (!requiredDataset) {
      allData[`${dataset}`] = [];
    }

    const isAlreadyPresent = allData[`${dataset}`].filter(
      (data) => data.id === input.id
    );

    if (isAlreadyPresent.length) {
      res.status(403).send(`Data with Id ${req.body.id} already present`);
    } else {
      allData[`${dataset}`].push(input);

      try {
        await writeFile(allData);
        res.status(201).send("Successfully Added");
      } catch (err) {
        console.log("Some error occured");
        console.log(err);
      }
    }
  });

  app.put("/:entity/:id", async (req, res) => {
    const dataset = req.params.entity;
    const Id = req.params.id;
    let allData;
    try {
      allData = await readFile(dataset);
    } catch (err) {
      throw err;
    }

    let statusCode, statusMessage;
    if (!allData[`${dataset}`]) {
      statusCode = 404;
      statusMessage = "Corresponding dataset is not present";
    } else {
      const index = allData[`${dataset}`].findIndex((data) => data.id === Id);
      if (index != -1) {
        allData[`${dataset}`][index] = req.body;
        statusCode = 200;
        statusMessage = "Changed the object";
      } else {
        statusCode = 201;
        allData[`${dataset}`].push(req.body);
        statusMessage = "Id not found, created new element";
      }
      try {
        await writeFile(allData);
      } catch {
        console.log(err);
      }
    }
    res.status(statusCode).send(statusMessage);
  });

  app.delete("/:entity/:id", async (req, res) => {
    const dataset = req.params.entity;
    const Id = req.params.id;
    let allData;
    try {
      allData = await readFile(dataset);
    } catch (err) {
      throw err;
    }
    let statusCode, statusMessage;
    if (!allData[`${dataset}`]) {
      statusCode = 404;
      statusMessage = "Corresponding dataset is not present";
    } else {
      const index = allData[`${dataset}`].findIndex((data) => data.id === Id);
      if (index != -1) {
        delete allData[`${dataset}`][index];
        statusCode = 200;
        statusMessage = `Successfully deleted ${Id}`;
        allData[`${dataset}`].splice(index, 1);

        try {
          await writeFile(allData);
        } catch (err) {
          console.log(err);
          console.log("Internal server error occur");
        }
      } else {
        statusCode = 404;
        statusMessage = `${dataset} with Id ${Id} not found`;
      }
    }

    res.status(statusCode).send(statusMessage);
  });

  app.patch("/:entity/:id", async (req, res) => {
    const dataset = req.params.entity;
    const Id = req.params.id;
    const dataToReplace = req.body;
    let allData;

    try {
      allData = await readFile(dataset);
    } catch (err) {
      throw err;
    }

    let statusCode, statusMessage;
    if (!allData[`${dataset}`]) {
      statusCode = 404;
      statusMessage = "Corresponding dataset is not present";
    } else {
      const index = allData[`${dataset}`].findIndex((data) => data.id === Id);
      if (index != -1) {
        //Check if user tries to change immutable Id attribute of the object
        if (dataToReplace.id) {
          statusCode = 403;
          statusMessage = "Id is immutable, change not allowed";
        } else {
          for (const [key, value] of Object.entries(dataToReplace)) {
            allData[`${dataset}`][index][`${key}`] = value;
          }
          statusCode = 200;
          statusMessage = "Object values changed successfully";
        }
      } else {
        statusCode = 404;
        statusMessage = "Id not found, created new element";
      }
      try {
        await writeFile(allData);
      } catch {
        console.log(err);
      }
    }
    res.status(statusCode).send(statusMessage);
  });
};

// export default appRouter;
module.exports = appRouter;
