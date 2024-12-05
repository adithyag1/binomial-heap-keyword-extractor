
let resultsdiv = document.getElementById("results");
para = new Map();
titles = new Map();
let filetime=0;
let generatedmap = false;
let wordMap = new Map();
const inputText = document.getElementById("textInput").value;
class Node {
  constructor(data, degree, words, loclist) {
    this.data = data;
    this.degree = degree;
    this.words = words;
    this.loclist = loclist;
    this.child = null;
    this.sibling = null;
    this.parent = null;
  }
}

function newNode(key, words, loclist) {
  let temp = new Node();
  temp.data = key;
  temp.degree = 0;
  temp.child = null;
  temp.parent = null;
  temp.sibling = null;
  temp.words = words;
  temp.loclist = loclist;
  return temp;
}

function merge(b1, b2) {
  if (
    b1.data > b2.data ||
    (b1.data === b2.data && b1.loclist[0] > b2.loclist[0])
  ) {
    let temp = b1;
    b1 = b2;
    b2 = temp;
  }
  b2.parent = b1;
  b2.sibling = b1.child;
  b1.child = b2;
  b1.degree++;
  return b1;
}

function union(l1, l2) {
  let _new = [];
  let it = 0;
  let ot = 0;

  while (it < l1.length && ot < l2.length) {
    if (l1[it].degree <= l2[ot].degree) {
      _new.push(l1[it]);
      it++;
    } else {
      _new.push(l2[ot]);
      ot++;
    }
  }

  while (it < l1.length) {
    _new.push(l1[it]);
    it++;
  }

  while (ot < l2.length) {
    _new.push(l2[ot]);
    ot++;
  }
  return _new;
}

function makeUniqueOrders(_heap) {
  if (_heap.length <= 1) return _heap;
  if (_heap.length === 2) {
    if (_heap[0].degree === _heap[1].degree) {
      _heap[0] = merge(_heap[0], _heap[1]);
      _heap.splice(1, 1);
    }
    return _heap;
  }
  let it = 0;
  while (it + 2 < _heap.length) {
    if (_heap[it].degree === _heap[it + 1].degree) {
      if (_heap[it].degree === _heap[it + 2].degree) {
        _heap[it + 1] = merge(_heap[it + 1], _heap[it + 2]);
        _heap.splice(it + 2, 1);
      } else {
        _heap[it] = merge(_heap[it], _heap[it + 1]);
        _heap.splice(it + 1, 1);
      }
    }
    it++;
  }
  return _heap;
}

function insert(_heap, tree) {
  let temp = [];
  temp.push(tree);
  temp = union(_heap, temp);
  return makeUniqueOrders(temp);
}

function eraseMin(tree) {
  let heap = [];
  let temp = tree.child;
  let lo;

  while (temp) {
    lo = temp;
    temp = temp.sibling;
    lo.sibling = null;
    lo.parent = null;
    heap.unshift(lo);
  }
  if (tree.child) tree.child.parent = null;
  tree.child = null;
  tree.degree = 0;
  return heap;
}

function getMin(_heap) {
  let temp = _heap[0];
  for (let i = 1; i < _heap.length; i++) {
    if (
      _heap[i].data < temp.data ||
      (_heap[i].data === temp.data &&
        _heap[i].loclist[0] < temp.loclist[0])
    ) {
      temp = _heap[i];
    }
  }
  return temp;
}

function extractMin(_heap) {
  let new_heap = [];
  let lo;
  let temp;

  temp = getMin(_heap);

  for (let i = 0; i < _heap.length; i++) {
    if (_heap[i] !== temp) {
      new_heap.push(_heap[i]);
    }
  }
  lo = eraseMin(temp);
  new_heap = union(new_heap, lo);
  new_heap = makeUniqueOrders(new_heap);
  return new_heap;
}
function printNode(node) {
  console.log(node);
}
function insertMap(node, resultMap, paraId) {
  if (!node) return;

  let concatenatedString = node.words.join(" ");
  if (!resultMap.has(concatenatedString)) {
    resultMap.set(concatenatedString, []);
  }
  resultMap.get(concatenatedString).push(paraId);
}

function printTree(h) {
  while (h) {
    printNode(h);
    printTree(h.child);
    h = h.sibling;
  }
}

function mapTree(h, resultMap, paraId) {
  while (h) {
    insertMap(h, resultMap, paraId);
    mapTree(h.child, resultMap, paraId);
    h = h.sibling;
  }
}
function printHeap(_heap) {
  for (let i = 0; i < _heap.length; i++) {
    console.log("Tree --", i, "---");
    printTree(_heap[i]);
  }
}

function mapHeap(_heap, paraId) {
  let resultMap = new Map();
  for (let i = 0; i < _heap.length; i++) {
    mapTree(_heap[i], resultMap, paraId);
  }

  resultMap.forEach((value, key) => {
    if (!wordMap.has(key)) {
      wordMap.set(key, []);
    }
    wordMap.get(key).push(...value);
  });
}

function traverseConcat(node, paraId, result) {
  const concats = node.words.join(" ");
  if (!result.has(concats)) {
    result.set(concats, []);
  }
  result.get(concats).push(paraId);

  let child = node.children;
  while (child) {
    traverseConcat(child, paraId, result);
    child = child.sibling;
  }

  return result;
}

function printMap(map) {
  map.forEach((value, key) => {
    console.log(`Key: ${key}, Value: ${value}`);
  });
}

function getTitles() {
  fetch("titles.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok fetching titles");
      }
      return response.json();
    })
    .then((data) => {
      let keys=Object.keys(data);
      keys.forEach((key)=>{
        titles[key]=data[key];
      });
    })
    .catch((error) => {
      console.error(
        "There was a problem with the fetch operation of titles",
        error
      );
    });
}

getTitles();

function main(paraId) {
  let times = 0;
  let binHeap = [];
  let keywordlist = [];
  let n = 69,
    m = 41;
  let threshold = 1,
    minsupport = 2;
  let positions = new Map();
  let starttime=new Date(),endtime;
  fetch("reduced/" + paraId + ".txt")
    .then((res) => res.text())
    .then((contents) => {
      
       endtime=new Date();
       filetime+=endtime-starttime;
    
      const words = contents.toLowerCase().match(/\b\w+\b/g);
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (!positions.has(word)) {
          positions.set(word, []);
        }
        positions.get(word).push(i);
      }
      positions.forEach((loclist, word) => {
        if (loclist.length >= minsupport) {
          let node = newNode(loclist.length, [word], loclist);
          binHeap = insert(binHeap, node);
        }
      });
      while (
        binHeap.length > 1 ||
        (binHeap.length === 1 && binHeap[0].degree > 0)
      ) {
        let minnode1, minnode2;
        minnode1 = getMin(binHeap);
        binHeap = extractMin(binHeap);
        minnode2 = getMin(binHeap);
        binHeap = extractMin(binHeap);

        let curloc1 = minnode1.loclist[0];
        let curloc2 = minnode2.loclist[0];
        let newwords = [...minnode1.words, ...minnode2.words];
        let newnode = newNode(0, newwords, []);
        let q1 = minnode1.loclist.slice();
        let q2 = minnode2.loclist.slice();

        while (curloc1 < curloc2) {
          if (curloc2 === curloc1 + 1) {
            newnode.loclist.push(curloc2);
            newnode.data++;

            minnode1.data--;
            minnode1.loclist.shift();
            curloc1 = minnode1.loclist[0];

            minnode2.data--;
            minnode2.loclist.shift();
            curloc2 = minnode2.loclist[0];
          } else break;
        }

        if (minnode1.data === 0 && minnode2.data === 0) {
          if (newnode) {
            binHeap = insert(binHeap, newnode);
          }
        } else {
          if (minnode1.words.length > 1) {
            keywordlist = insert(keywordlist, minnode1);
          }
          if (minnode2.words.length > 1) {
            keywordlist = insert(keywordlist, minnode2);
          } else if (minnode2.data !== 0) {
            minnode2.loclist = q2;
            minnode2.data = minnode2.loclist.length;
            binHeap = insert(binHeap, minnode2);
          }
        }
      }
      if (binHeap.length) {
        let minnode = getMin(binHeap);
        binHeap = extractMin(binHeap);
        if (minnode.words.length > 1) {
          keywordlist = insert(keywordlist, minnode);
        }
      }
      keywordlist.forEach((node) => {
        node.words = [node.words.join(" ")];
      });
      mapHeap(keywordlist, paraId);
      console.log("\n");
      console.log("Keywords of ",paraId);
      printHeap(keywordlist);
      console.log("\n");
    })

    .catch((error) =>
      console.log("Error in opening reduced paragraph", error)
    );

  fetch("paras/" + paraId + ".txt")
    .then((res) => res.text())
    .then((text) => {
      para.set(paraId, text);
    })
    .catch((error) => console.log("Error fetching text file", error));
  return 0;
}

function decrChar(ch) {
  switch (ch) {
    case "A":
      return [true, "9"];
    case "a":
      return [true, "9"];
    case "0":
      return [true, "Z"];
    default:
      return [false, String.fromCharCode(ch.charCodeAt(0) - 1)];
  }
}

function predecessor(input) {
  let X = input.charAt(0);
  let Y = input.charAt(1);
  let Z = input.charAt(2);
  let flag = false;
  [flag, Z] = decrChar(Z);
  if (flag == false) return X + Y + Z;
  [flag, Y] = decrChar(Y);
  if (flag == false) return X + Y + Z;
  [flag, X] = decrChar(X);
  return X + Y + Z;
}
async function iterateFiles() {
  let paraId = "AAI";
  const stopId = "999";

  while (paraId !== stopId) {
    await main(paraId);
    paraId = predecessor(paraId);
  }
  console.log("File time = ",filetime);
  generatedmap = true;
}
iterateFiles();

function searchButtonClick() {
  resultsdiv.innerHTML = "";
  let inputText = document.getElementById("textInput").value;
  inputText = inputText.replace(/[^\w\s]/g, "");
  inputText = inputText.toLowerCase();
  inputText = inputText.trim();
  if (wordMap.has(inputText)) {
    const paraIds = wordMap.get(inputText);
    console.log(paraIds);
    paraIds.forEach((paraId) => {
      const paradiv = document.createElement("div");
      paradiv.innerText = titles[paraId];
      const button = document.createElement("button");
      button.textContent = "Open";
      paradiv.appendChild(button);
      button.addEventListener("click", () => {
        const paragraph = document.createElement("p");
        paragraph.textContent = para.get(paraId);
        paradiv.appendChild(paragraph);
      },{once:true});
      resultsdiv.appendChild(paradiv);
    });
  } else {
    if (!wordMap.has(inputText)) {
      resultsdiv.innerText="No matches found! Try another keyword phrase."
    }
  }
}
