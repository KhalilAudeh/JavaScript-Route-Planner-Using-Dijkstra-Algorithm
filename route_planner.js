// Make sure we got a filename on the command line.
if (process.argv.length < 5) {
  console.log(
    "ERROR IN USER INPUTS: it has to be file name, start city & destination city!"
  );
  process.exit(1);
}

// Read the file and print its contents.
var fs = require("fs"),
  filename = process.argv[2],
  start = process.argv[3],
  destination = process.argv[4];

const addDistanceToCityScores = (scores, parentCity, childCity, distance) => {
  if (!scores[parentCity]) {
    scores[parentCity] = {
      [childCity]: Number(distance),
    };
  } else
    scores[parentCity] = {
      ...scores[parentCity],
      [childCity]: Number(distance),
    };
  return scores;
};

const createCitiesDistanceMap = (distancesArr) => {
  const distancesMap = distancesArr.reduce((acc, cur) => {
    const [cityA, cityB, distance] = cur;
    // handle city A -- city B
    acc = addDistanceToCityScores(acc, cityA, cityB, distance);
    // handle city B -- city A
    acc = addDistanceToCityScores(acc, cityB, cityA, distance);
    return acc;
  }, {});
  return distancesMap;
};

// part to be used in Dijkstra algorithm
let shortestDistanceNode = (distances, visited) => {
  // create a default value for shortest
  let shortest = null;

  // for each node in the distances object
  for (let node in distances) {
    // if no node has been assigned to shortest yet
    // or if the current node's distance is smaller than the current shortest
    let currentIsShortest =
      shortest === null || distances[node] < distances[shortest];

    // and if the current node is in the unvisited set
    if (currentIsShortest && !visited.includes(node)) {
      // update shortest to be the current node
      shortest = node;
    }
  }
  return shortest;
};

fs.readFile(filename, (err, data) => {
  if (err) throw err;
  const distancesArr = data
    .toString()
    .split("\n")
    .map((distanceString) => distanceString.split(","));
  const distancesMap = createCitiesDistanceMap(distancesArr);

  let findShortestPath = (graph, startNode, endNode) => {
    // track distances from the start node using a hash object
    let distances = {};
    distances[endNode] = "Infinity";
    distances = Object.assign(distances, graph[startNode]);
    // track paths using a hash object
    let parents = {
      endNode: null,
    };
    for (let child in graph[startNode]) {
      parents[child] = startNode;
    }

    // collect visited nodes
    let visited = [];
    // find the nearest node
    let node = shortestDistanceNode(distances, visited);

    // for that node:
    while (node) {
      // find its distance from the start node & its child nodes
      let totalTime = distances[node];
      let children = graph[node];

      // for each of those child nodes:
      for (let child in children) {
        // make sure each child node is not the start node
        if (String(child) === String(startNode)) {
          continue;
        } else {
          // save the distance from the start node to the child node
          let newdistance = totalTime + children[child];
          // if there's no recorded distance from the start node to the child node in the distances object
          // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
          if (!distances[child] || distances[child] > newdistance) {
            // save the distance to the object
            distances[child] = newdistance;
            // record the path
            parents[child] = node;
          }
        }
      }
      // move the current node to the visited set
      visited.push(node);
      // move to the nearest neighbor node
      node = shortestDistanceNode(distances, visited);
    }

    // using the stored paths from start node to end node
    // record the shortest path
    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
      shortestPath.push(parent);
      parent = parents[parent];
    }
    shortestPath.reverse();

    //this is the shortest path
    let results = {
      route: shortestPath,
      totalTime: distances[endNode],
    };

    // return the shortest path & the end node's distance from the start node
    return results;
  };

  console.log(findShortestPath(distancesMap, start, destination));
});

// let graph = {
//   Mjømna: {
//     Furenes: 5,
//   },
//   Furenes: {
//     Mjømna: 5,
//     Eivindvik: 7,
//   },
//   Eivindvik: {
//     Furenes: 7,
//     Rutledal: 15,
//     Oppedal: 12,
//   },
//   Oppedal: {
//     Eivindvik: 12,
//     Rutledal: 10,
//   },
//   Rutledal: {
//     Eivindvik: 15,
//     Oppedal: 10,
//     Daløy: 17,
//     Sløvåg: 10,
//     Ynnesdal: 20,
//   },
//   Nåra: {
//     Daløy: 11,
//     Leirvik: 30,
//   },
//   Daløy: {
//     Nåra: 11,
//     Rutledal: 17,
//   },
//   Sløvåg: {
//     Daløy: 9,
//     Rutledal: 10,
//   },
//   Ynnesdal: {
//     Rutledal: 20,
//     Leirvik: 16,
//   },
//   Leirvik: {
//     Ynnesdal: 16,
//     Nåra: 30,
//   },
// };
