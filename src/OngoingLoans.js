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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Lorem,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons'
import './App.css'

import * as nearAPI from "near-api-js";
import BN from 'bn.js';

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days"
}

function OngoingLoans() {

  const [loans, setLoans] = useState([]);

  async function ClaimCollateralCallback(loan_id) {
    
    try {
        await window.contract.claim_collateral({
            loan_id,
        }, 300000000000000, 1)
        fetchLoans()
        onClose()
    } catch (error) {
        console.error(error);
    }
    
  }

  async function PaybackCallback(loan_id) {
      
    try {
      let payback_amount = await window.contract.get_payback_amount({loan_id})
      await window.contract.payback_loan({loan_id}, 300000000000000, payback_amount.toLocaleString('fullwide', {useGrouping:false}))
      fetchLoans()
    } catch (error) {
      console.error(error);
    }
    
  }

  async function fetchLoans (){
    let ids = await window.contract.get_loan_ids();

    let loan_ids = [];
    for(let i = 0; i < ids.length; i++){
      let loan = await window.contract.get_loan({
        loan_id: ids[i]
      });

      console.log(ids[i].split('|')[0], window.accountId)
      if (loan != null && loan.start_time != null && (ids[i].split('|')[0] == window.accountId || loan.counter_part == window.accountId)){
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
        isLender: loan.counter_part == window.accountId,
        start_time: loan.start_time,
        paid: loan.paid,
      }
    }))).reverse());
    
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amount, setAmount] = useState(0);
    const [interest, setInterest] = useState(0);
    const [duration, setDuration] = useState(0);
    const [selectedToken, setSelectedToken] = useState({
        token_id: '65',
        owner_id: 'amino.testnet',
        metadata: {
          title: 'DEGEN Lizards #65',
          description: "DEGEN Lizards is a collection of 1000 lizards DEGENING around on the NEARverse. We're building NEAR's first casino and sharing all profits with our holders.",
          media: 'https://metadata.degenlizards.com/images/65.png',
          media_hash: null,
          copies: null,
          issued_at: null,
          expires_at: null,
          starts_at: null,
          updated_at: null,
          extra: null,
          reference: 'https://metadata.degenlizards.com/json/65.json',
          reference_hash: null
        },
        approved_account_ids: {},
        royalty: { 'bacarrat.testnet': 500 },
        contract: '3.bacarrat.testnet'
    });

  return (

    <Grid my='5vh' mx='5vw' maxW='80vw' templateColumns='repeat(4, 1fr)' gap={6}>

      { 
        loans.map((loan) => {

          console.log(loan.paid)
          
          if(loan.isLender) {
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
                    <Tag m={1} size='sm' key='s3' variant='outline'>
                      <TagLabel>Time Left : {msToTime((loan.duration/1000000) - Date.now() + (loan.start_time/1000000))}</TagLabel>
                    </Tag>
                    <Tag m={1} size='sm' key='s3' variant='outline'>
                      <TagLabel>Paid : {loan.paid ? 'True' : 'False'}</TagLabel>
                    </Tag>
                </Flex>
                <Flex>
                    
                {
                  (Date.now() - (loan.start_time/1000000) < (loan.duration/1000000)  && !loan.paid) ? (
                    <>
                    </>
                  ) : (
                    <Button mx={4} onClick={() => {ClaimCollateralCallback(loan.id)}} colorScheme='blackAlpha'>Claim Collateral</Button>
                  )
                }
                </Flex>
              </VStack>
            </Box>
            );
          }
          else
          {
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
                    <Tag m={1} size='sm' key='s3' variant='outline'>
                      <TagLabel>Time Left : {msToTime((loan.duration/1000000) - Date.now() + (loan.start_time/1000000))}</TagLabel>
                    </Tag>
                    <Tag m={1} size='sm' key='s3' variant='outline'>
                      <TagLabel>Resolved : {loan.paid ? 'True' : 'False'}</TagLabel>
                    </Tag>
                </Flex>
                <Flex>

                {
                  (Date.now() - (loan.start_time/1000000) < (loan.duration/1000000) && !loan.paid) ? (
                    
                    <Button mx={4} onClick={() => {PaybackCallback(loan.id)}} colorScheme='blackAlpha'>Payback Loan</Button>
                    
                  ) : (
                    <>
                    </>
                  )
                }
                </Flex>
              </VStack>
            </Box>
            );
          }

          
        })
      }
      
    </Grid>

  );
}

export default OngoingLoans;
