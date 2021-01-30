const { readFile, writeFile } = require("../services/service");

const appRouter = (app, fs) => {
  app.get("/alldata", async (req, res) => {
    let allData;
    try {
      allData = await readFile(fs);
    } catch (err) {
      throw err;
    }
    res.send(allData);
  });

  app.get("/:entity/:id", async (req, res) => {
    const dataset = req.params.entity;
    const Id = req.params.id;
    let allData, requiredDataset;

    try {
      allData = await readFile(fs);
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
    const queryObject = req.query;
    try {
      allData = await readFile(fs);
    } catch (err) {
      console.log(err);
      res.send("Some error occured");
    }
    let requiredDataset = allData[`${dataset}`];

    if (Object.keys(queryObject).length && dataset === "posts") {
      const title = queryObject.title;
      const author = queryObject.author;
      const sortingParameter = queryObject._sort;
      const sortingOrder = queryObject._order;
      if (title && author) {
        requiredDataset = requiredDataset.filter(
          (data) => data.title === title && data.author === author
        )[0];
      }

      if (
        sortingParameter &&
        (sortingOrder === "asc" || sortingOrder === "desc")
      ) {
        const greater = sortingOrder === "asc" ? 1 : -1;
        const less = sortingOrder === "asc" ? -1 : 1;

        //Comparator function for sorting
        const compare = (a, b) => {
          const numberA = Number(a[`${sortingParameter}`]);
          const numberB = Number(b[`${sortingParameter}`]);
          return numberA > numberB ? greater : numberA < numberB ? less : 0;
        };

        // sort the data according to the given parameter and order
        requiredDataset.sort(compare);
      }
    }

    //check if corresponding dataset is present or not
    if (requiredDataset) res.send(requiredDataset);
    else res.send(`${dataset} not found in database`);
  });

  app.post("/:entity", async (req, res) => {
    const dataset = req.params.entity;
    let allData;
    let input = req.body;
    // If id is not present in the input object then generate an id
    if (!input.id) {
      input["id"] = toString(Date.now());
    }

    try {
      allData = await readFile(fs);
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
        await writeFile(fs, allData);
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
      allData = await readFile(fs);
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
        await writeFile(fs, allData);
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
      allData = await readFile(fs);
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
          await writeFile(fs, allData);
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
      allData = await readFile(fs);
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
        await writeFile(fs, allData);
      } catch {
        console.log(err);
      }
    }
    res.status(statusCode).send(statusMessage);
  });
};

// export default appRouter;
module.exports = appRouter;
// export { appRouter };
