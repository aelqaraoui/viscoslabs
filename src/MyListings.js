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

function MyListings() {

  const [loans, setLoans] = useState([]);

  async function EditLoanCallback(loan_id) {
    
    try {
        await window.contract.edit_loan({
            loan_id,
            new_amount: amount == 0 ? null : (amount * 100).toFixed(0).toString() + "0000000000000000000000",
            new_duration: duration == 0 ? null : parseInt(duration),
            new_interesr: interest == 0 ? null : parseFloat(interest),
        }, 100000000000000, 1)
        fetchLoans()
        onClose()
    } catch (error) {
        console.error(error);
    }
    
  }

  async function RemoveLoanCallback(loan_id) {
      
    try {
      await window.contract.remove_loan({loan_id}, 300000000000000, 1)
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
      if (loan != null && loan.start_time == null && ids[i].split('|')[0] == window.accountId){
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

  useEffect(() => {
    fetchLoans()
  }, [])

  function handleChangeAmount(event) {
      console.log(event.target.value)
    setAmount(event.target.value)
  }

  function handleChangeInterest(event) {
    setInterest((event.target.value/100.0).toFixed(2))
  }

  function handleChangeDuration(event) {
    setDuration(event.target.value * 24 * 3600000000000)
  }

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
                <Flex>
                <Button mx={4} onClick={() => {
                    setAmount(0)
                    setInterest(0)
                    setDuration(0)
                    setSelectedToken({metadata: loan.metadata})
                    onOpen()
                    }} colorScheme='blackAlpha'>Edit</Button>
                <Button mx={4} onClick={() => {RemoveLoanCallback(loan.id, loan.amount)}} colorScheme='blackAlpha'>Remove</Button>
                </Flex>
              </VStack>

              <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                    <ModalHeader>Edit Loan Listing</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    <VStack minW='37%' maxH='60%'>
                        <Image w='80%' src={selectedToken.metadata.media} alt='Dan Abramov' />
                        <Text>{selectedToken.metadata.title}</Text>
                        <InputGroup>
                            <InputLeftAddon children='Loan Amount' />
                            <Input type='number' onChange={handleChangeAmount}/>
                            <InputRightAddon children='N' />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftAddon children='Interest' />
                            <Input type='number' onChange={handleChangeInterest}/>
                            <InputRightAddon children='%' />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftAddon children='Duration' />
                            <Input type='number' onChange={handleChangeDuration}/>
                            <InputRightAddon children='days' />
                        </InputGroup>
                    </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Close
                        </Button>
                        <Button onClick={() => {EditLoanCallback(loan.id)}}>Edit</Button>
                    </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
          )
        })
      }
      
    </Grid>

  );
}

export default MyListings;
