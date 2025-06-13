const CONTRACT_ADDRESS = "0x206843453E692aF1F65239c3DF25d9a18a4909b0";
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
              correctAnswer: "final", // (trick question; Solidity uses 'virtual' and 'override', but 'final' is wrong)
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
            id: 5, // New unique ID
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
        }
      ]
    }
  ];
  