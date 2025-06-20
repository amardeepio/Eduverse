export const CONTRACT_ADDRESS = "0x206843453E692aF1F65239c3DF25d9a18a4909b0";
export const categories = [
  {
    categoryName: "Blockchain 101",
    courses: [
      {
        id: 1,
        title: "Solidity Fundamentals",
        description: "Learn the basics of Ethereum's smart contract language.",
        quiz: [
          {
            question: "What keyword is used to declare a state variable that can be changed?",
            options: ["constant", "public", "internal", "string"],
            correctAnswer: "public",
          },
          {
            question: "What is the primary purpose of a 'constructor'?",
            options: ["To destroy a contract", "To initialize state variables on deployment", "To receive Ether", "To define a function"],
            correctAnswer: "To initialize state variables on deployment",
          },
          {
            question: "Which type is used to store an Ethereum address?",
            options: ["address", "uint256", "string", "mapping"],
            correctAnswer: "address",
          },
          {
            question: "Which keyword prevents a function from being overridden?",
            options: ["override", "constant", "final", "virtual"],
            correctAnswer: "final",
          }
        ],
      },
      {
        id: 2,
        title: "Introduction to NFTs",
        description: "Understand the technology behind Non-Fungible Tokens.",
        quiz: [
          {
            question: "What does ERC-721 define?",
            options: ["A standard for fungible tokens", "A standard for decentralized finance", "A standard for non-fungible tokens", "A standard for blockchain explorers"],
            correctAnswer: "A standard for non-fungible tokens",
          },
          {
            question: "Which Ethereum token standard allows batch transfers of NFTs?",
            options: ["ERC-20", "ERC-721", "ERC-1155", "ERC-777"],
            correctAnswer: "ERC-1155",
          },
          {
            question: "Which metadata attribute is typically used to store the image of an NFT?",
            options: ["icon", "tokenURI", "src", "image"],
            correctAnswer: "image",
          },
          {
            question: "Can two NFTs under ERC-721 have the same token ID?",
            options: ["Yes", "No", "Only on testnet", "Only if they are burned"],
            correctAnswer: "No",
          }
        ],
      },
      {
        id: 3,
        title: "Web3 Wallets 101",
        description: "Explore how wallets interact with decentralized applications.",
        quiz: [
          {
            question: "What is a 'seed phrase'?",
            options: ["Your wallet's password", "A list of 12-24 words that can restore your wallet", "Your public address", "A type of transaction"],
            correctAnswer: "A list of 12-24 words that can restore your wallet",
          },
          {
            question: "Which wallet is commonly used as a browser extension?",
            options: ["Coinbase", "MetaMask", "Trust Wallet", "Ledger"],
            correctAnswer: "MetaMask",
          },
          {
            question: "What is a public key used for?",
            options: ["Encrypting transactions", "Generating seed phrases", "Identifying a wallet address", "Resetting passwords"],
            correctAnswer: "Identifying a wallet address",
          },
          {
            question: "Which of the following is NOT a hot wallet?",
            options: ["MetaMask", "Trust Wallet", "Ledger Nano", "Coinbase Wallet"],
            correctAnswer: "Ledger Nano",
          }
        ]
      },
      {
        id: 5,
        title: "Understanding Gas Fees",
        description: "Learn why transactions cost money on a blockchain.",
        quiz: [
          {
            question: "What unit is gas typically measured in?",
            options: ["Ether", "Gwei", "Satoshi", "Dollars"],
            correctAnswer: "Gwei",
          }
        ]
      }
    ]
  },
  {
    categoryName: "Computer Science",
    courses: [
      {
        id: 4,
        title: "Data Structures: Arrays",
        description: "An introduction to the most fundamental data structure.",
        quiz: [
          {
            question: "What is the time complexity for accessing an element by index in an array?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            correctAnswer: "O(1)",
          },
          {
            question: "What is the typical time complexity for inserting an element at the end of a dynamic array?",
            options: ["O(1) on average", "O(n)", "O(log n)", "O(n^2)"],
            correctAnswer: "O(1) on average",
          },
          {
            question: "Which of these languages does NOT allow dynamic resizing of arrays by default?",
            options: ["Python", "JavaScript", "C", "Java"],
            correctAnswer: "C",
          },
          {
            question: "What is the main drawback of using arrays over linked lists?",
            options: ["Arrays are slower", "Arrays can't store strings", "Fixed size or costly resizing", "Arrays need more memory"],
            correctAnswer: "Fixed size or costly resizing",
          }
        ]
      },
      {
        id: 6,
        title: "Introduction to Algorithms",
        description: "Understand how algorithms work and why they matter.",
        quiz: [
          {
            question: "What is Big O notation used for?",
            options: ["Measuring memory usage", "Describing runtime performance", "Counting variables", "Defining classes"],
            correctAnswer: "Describing runtime performance",
          },
          {
            question: "Which sorting algorithm has the best average case time complexity?",
            options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
            correctAnswer: "Merge Sort",
          },
          {
            question: "What does a binary search require?",
            options: ["A graph", "An unsorted array", "A sorted array", "A hash map"],
            correctAnswer: "A sorted array",
          },
          {
            question: "Which algorithm is commonly used in pathfinding?",
            options: ["A*", "Merge Sort", "Binary Search", "Quick Sort"],
            correctAnswer: "A*",
          }
        ]
      },
      {
        id: 7,
        title: "Operating Systems Basics",
        description: "Discover how operating systems manage hardware and software.",
        quiz: [
          {
            question: "What is a process?",
            options: ["A type of storage", "A program in execution", "A function call", "A user interface"],
            correctAnswer: "A program in execution",
          },
          {
            question: "Which component handles CPU scheduling?",
            options: ["Memory Manager", "Process Scheduler", "File System", "I/O Handler"],
            correctAnswer: "Process Scheduler",
          },
          {
            question: "What is virtual memory?",
            options: ["External storage", "Cache memory", "An illusion of more memory", "Encrypted memory"],
            correctAnswer: "An illusion of more memory",
          },
          {
            question: "Which system call creates a new process?",
            options: ["malloc()", "fork()", "exec()", "init()"],
            correctAnswer: "fork()",
          }
        ]
      },
      {
        id: 8,
        title: "Database Fundamentals",
        description: "Explore relational databases and query languages.",
        quiz: [
          {
            question: "Which language is used to query relational databases?",
            options: ["NoSQL", "HTML", "SQL", "XML"],
            correctAnswer: "SQL",
          },
          {
            question: "Which command retrieves data from a table?",
            options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
            correctAnswer: "SELECT",
          },
          {
            question: "What is a primary key?",
            options: ["A field that can be null", "A duplicate value", "A unique identifier", "A foreign key"],
            correctAnswer: "A unique identifier",
          },
          {
            question: "Which of the following is a relational database?",
            options: ["MongoDB", "Redis", "PostgreSQL", "Neo4j"],
            correctAnswer: "PostgreSQL",
          }
        ]
      }
    ]
  },
  {
    categoryName: "Networking",
    courses: [
      {
        id: 9,
        title: "Networking Basics",
        description: "Understand how computers communicate over a network.",
        quiz: [
          {
            question: "What does IP stand for?",
            options: ["Internet Process", "Internet Protocol", "Internal Protocol", "Instance Path"],
            correctAnswer: "Internet Protocol",
          },
          {
            question: "What is the role of DNS?",
            options: ["Encrypt messages", "Translate domain names to IP addresses", "Connect to Wi-Fi", "Allocate bandwidth"],
            correctAnswer: "Translate domain names to IP addresses",
          },
          {
            question: "Which device routes packets between networks?",
            options: ["Modem", "Switch", "Router", "Hub"],
            correctAnswer: "Router",
          },
          {
            question: "What port does HTTP use by default?",
            options: ["21", "25", "80", "443"],
            correctAnswer: "80",
          }
        ]
      }
    ]
  },
  {
    categoryName: "JavaScript 101",
    courses: [
      {
        id: 10,
        title: "JavaScript Basics",
        description: "Get started with the core concepts of JavaScript programming.",
        quiz: [
          {
            question: "Which keyword declares a block-scoped variable?",
            options: ["var", "let", "const", "both let and const"],
            correctAnswer: "both let and const",
          },
          {
            question: "What will `typeof null` return?",
            options: ["null", "object", "undefined", "function"],
            correctAnswer: "object",
          },
          {
            question: "Which method is used to parse JSON strings?",
            options: ["JSON.stringify()", "JSON.parse()", "JSON.decode()", "parseJSON()"],
            correctAnswer: "JSON.parse()",
          },
          {
            question: "Which operator is used for strict equality?",
            options: ["=", "==", "===", "!=="],
            correctAnswer: "===",
          }
        ]
      }
    ]
  }
];
