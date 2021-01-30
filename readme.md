**Api endpoint base URL**: https://mockserver-commerceiq.herokuapp.com

### About the project

- RESTful api that stores and retrieves data from a .json file.
- The structure of the object stored in file:

```json
{
  "posts": [
    {
      "id": "0",
      "title": "title1",
      "author": "CIQ",
      "views": "100",
      "reviews": "31"
    },
    {
      "id": "1",
      "title": "title2",
      "author": "CommerceIQ",
      "views": "10",
      "reviews": "3"
    },
    {
      "id": "2",
      "title": "title3",
      "author": "myname",
      "views": "500",
      "reviews": "60"
    }
  ],
  "authors": [
    {
      "id": "0",
      "first_name": "commerce",
      "last_name": "IQ",
      "posts": "45"
    }
  ]
}
```

- **Here each key is referred to as "entity" in the api.**
- More keys, i.e. entities, can be inserted into the file using POST request.

#### Usage information for different request methods:

Append the endpoint after the base URL.

#### GET:

- **Endpoint**: "/alldata"
  - This will return all the data in the .json file data store.
- **Endpoint**: "/:entity"
  - Replace ":entity" with the corresponding dataset that you want to access in the data store.
  - Example: "https://mockserver-commerceiq.herokuapp.com/posts"
- **Endpoint**: "/:entity/:id"
  - Replace ":entity" with the corresponding dataset that you want to access in the data store.
  - Replace ":id" with the id of the specific element that you want to access in the data store.
  - Example: "https://mockserver-commerceiq.herokuapp.com/posts/1"
- **Query parameters**:
  - "/posts?title=titleValue&author=authorValue"
    - Replace "titlevalue" with any title of post and "authorValue" with any author name to search filter out the posts which contain that value
  - "/posts?\_sort=sortAttribute&\_order=orderOfSorting"
    - Replace "sortAttributes" with corresponding key to sort according to it's values and "orderOfSorting" with "asc" or "desc" for ascending and descending order of sorting.

#### POST:

- **Endpoint**: "/:entity"
  - Pass the object to be inserted into the data store in the body of the request.
  - Replace entity with the dataset in which you want to add the object.
  - Example: (If using axios to make the request)
  ```javascript
  axios.post("https://mockserver-commerceiq.herokuapp.com/posts", {
    id: "3",
    title: "title4",
    author: "somename",
    views: "500",
    reviews: "60",
  });
  ```

#### PUT:

- **Endpoint**: "/:entity/:id"
  - Replace ":id" with the id of object which you want to replace and ":entity" with the corresponding dataset to which the object belongs.
  - Pass the object in request body to replace the object present in the datastore
  - Example: (If using axios to make the request)
  ```javascript
  axios.put("https://mockserver-commerceiq.herokuapp.com/posts/1", {
    id: "5",
    title: "newtitle",
    author: "somename",
    views: "500",
    reviews: "60",
  });
  ```

#### PATCH:

- **Endpoint**: "/:entity/:id"
  - Similar to POST request, except pass only those key-value pairs in the object which you need to change.
  - Example: Suppose you want to change "author" and "views" of the post with id=1,
  ```javascript
  axios.patch("https://mockserver-commerceiq.herokuapp.com/posts/1", {
    author: "somename",
    views: "500",
  });
  ```

#### DELETE:

- **Endpoint**: "/:entity/:id"
  - To delete and object pass the corresponding ":entity" and ":id".
  - Example: To delete post with id=2

````javascript
	 axios.delete(
	 "https://mockserver-commerceiq.herokuapp.com/posts/2"
	 )
	 ```
````
