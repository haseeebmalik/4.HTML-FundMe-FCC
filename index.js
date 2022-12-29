import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereun !== undefined) {
        console.log("Hey...I see metamask.")
        //This will connect our website with metamask wallet.
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("connected.")
    } else {
        console.log("No metamask.")
    }
}

async function getBalance() {
    if (typeof window.ethereun !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    // const ethAmount = "2"
    const ethAmount = document.getElementById("ETHAmount").value
    console.log(`funding with ${ethAmount} ETH ...`)
    if (typeof window.ethereum !== undefined) {
        // provider /connection to blockchain
        // signer /wallet /someone with some gas
        // contract that we are interacting with
        // ^abi & address

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //listen for the transaction to be mined
            //listen for the event <- we havent learned about yet

            await listenForTransactionMine(transactionResponse, provider)
            console.log("done.")
        } catch (err) {
            console.log("Error while transaction:", err)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for the transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations.`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereun !== undefined) {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (err) {
            console.log("error in withdraw function", err)
        }
    }
}
