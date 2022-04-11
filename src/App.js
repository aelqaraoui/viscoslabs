import { React, useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import './App.css'

import * as nearAPI from "near-api-js";
import { login, logout } from "./utils";

import Header from './Header';
import LoanListings from './LoanListings';
import CreateLoan from './CreateLoan';
import MyLoans from './MyLoans';

function App() {

  const [pageSelected, setPageSelected] = useState(0);
  const [tokens, setTokens] = useState([]);

  function switchLoanListings() {
    setPageSelected(0)
  }

  function switchCreateLoan() {
    setPageSelected(1)
  }

  function switchMyLoans() {
    setPageSelected(2)
  }

  useEffect(() => {

    async function fetchTokens (){
      let contracts = await window.contract.get_verified_contracts();

      for(let i = 0; i < contracts.length; i++){
        window.nft_contract = await new nearAPI.Contract(
          window.walletConnection.account(),
          contracts[i],
          {
            // View methods are read only. They don't modify the state, but usually return some value.
            viewMethods: [
              "nft_tokens_for_owner",
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [],
          }
        );
  
        let response = await window.nft_contract.nft_tokens_for_owner({
            account_id: window.walletConnection.account().accountId,
            from_index: "0",
            limit: 100,
        })
  
        setTokens(tokens.concat(response.map((token) => {
          return {
            token_id: token.token_id,
            owner_id: token.owner_id,
            metadata: token.metadata,
            approved_account_ids: token.approved_account_ids,
            royalty: token.royalty,
            contract: contracts[i]
        }
        })))

      }
      
    }

    fetchTokens()

  }, [])  

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" px='10vw' py='2vh' fontSize="xl">
        <Header callbackLoanListings={switchLoanListings} callbackCreateLoan={switchCreateLoan} callbackMyLoans={switchMyLoans}/>
        {
          window.walletConnection.isSignedIn() ? (
            <>
            {
              pageSelected === 0 ? (
                <LoanListings />
              ) : pageSelected === 1 ? (
                <CreateLoan tokens={tokens} />
              ) : (
                <MyLoans />
              )
            }
            </>
          ) : (
            <Text mx='20vw' my='20vh' fontSize='4xl'>Please Connect your Wallet</Text>
          )
          
        }
        
      </Box>
    </ChakraProvider>
  );
}

export default App;
