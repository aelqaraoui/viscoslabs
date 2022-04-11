import { React, useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Flex,
  Spacer,
  Grid,
  theme,
  Stack,
  Button,
  Image,
  HStack,
  Input,
  InputLeftAddon,
  InputRightAddon,
  InputGroup,
  Tag,
  TagLabel,
  TagRightIcon,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons'
import './App.css'

import * as nearAPI from "near-api-js";
import BN from 'bn.js';

function LoanListings() {

  const [loans, setLoans] = useState([]);

  async function AcceptLoanCallback(loan_id, amount) {
    console.log(amount.toLocaleString('fullwide', {useGrouping:false}))
    try {
      const response = await window.contract.accept_loan({loan_id}, 
      100000000000000,
      amount.toLocaleString('fullwide', {useGrouping:false})
      )

      console.log(response)

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function fetchLoans (){
      let ids = await window.contract.get_loan_ids();

      console.log(ids)

      let loan_ids = [];
      for(let i = 0; i < ids.length; i++){
        let loan = await window.contract.get_loan({
          loan_id: ids[i]
        });

        console.log(loan)

        if (loan != null && loan.start_time == null){
          loan_ids.push(ids[i]);
        } 
      }

      setLoans((await Promise.all(loan_ids.map(async (id) => {

        let loan = await window.contract.get_loan({
          loan_id: id
        });

        window.nft_contract = await new nearAPI.Contract(
          window.walletConnection.account(),
          id.split('|')[1],
          {
            // View methods are read only. They don't modify the state, but usually return some value.
            viewMethods: [
              "nft_token",
            ],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [],
          }
        );

        let token = await window.nft_contract.nft_token({
            token_id: loan.token_id,
        })
        
        return {
          id,
          contract: id.split('|')[1],
          token_id: id.split('|')[2],
          amount: loan.amount,
          duration: loan.duration,
          interest: loan.interest,
          metadata: token.metadata,
        }
      }))).reverse());
      
    }

    fetchLoans()
  }, [])

  return (

    <Grid my='5vh' mx='5vw' maxW='80vw' templateColumns='repeat(4, 1fr)' gap={6}>

      { 
        loans.map((loan) => {
          

          return (
            <Box w='15vw' h='100%' bgColor='gray.200' p={5} borderRadius={10}>
              <VStack>
                <Image w='10vw' src={loan.metadata.media} alt='Dan Abramov' />
                <Text>{loan.metadata.title}</Text>
                <Flex wrap='wrap' spacing={4} justifyContent='center'>
                  <Tag m={1} size='sm' key='sm1' variant='outline'>
                    <TagLabel>Amount : {(loan.amount / 1000000000000000000000000).toFixed(2)}N</TagLabel>
                  </Tag>
                  <Tag m={1} size='sm' key='sm2' variant='outline'>
                    <TagLabel>Interest : {(loan.interest * 100).toFixed(0)}%</TagLabel>
                  </Tag>
                  <Tag m={1} size='sm' key='s3' variant='outline'>
                    <TagLabel>Duration : {loan.duration / (24*3600000000000)} days</TagLabel>
                  </Tag>
                </Flex>
                <Button onClick={() => {AcceptLoanCallback(loan.id, loan.amount)}} colorScheme='blackAlpha'>Accept</Button>
              </VStack>
            </Box>
          )
        })
      }

      
      
    </Grid>

  );
}

export default LoanListings;
