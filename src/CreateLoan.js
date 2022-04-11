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
  Skeleton
} from '@chakra-ui/react';
import './App.css'

import * as nearAPI from "near-api-js";

function CreateLoan(props) {

    function handleChangeAmount(event) {
      setAmount(event.target.value)
    }

    function handleChangeInterest(event) {
      setInterest((event.target.value/100.0).toFixed(2))
    }

    function handleChangeDuration(event) {
      setDuration(event.target.value * 24 * 3600000000000)
    }

    async function CreateLoanCallback() {

      try {
        window.nft_contract = await new nearAPI.Contract(
          window.walletConnection.account(),
          selectedToken.contract,
          {
            // View methods are read only. They don't modify the state, but usually return some value.
            viewMethods: [],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: [
              "nft_transfer_call",
            ],
          }
        );
  
        const response = await window.nft_contract.nft_transfer_call({
            receiver_id: "loan.thugg.testnet",
            token_id: selectedToken.token_id,
            approval_id: 0,
            msg: selectedToken.contract + '|' + selectedToken.token_id + '|' + nearAPI.utils.format.parseNearAmount(amount) + '|' + duration + "|" + interest
        }, 
        100000000000000,
        1)

        console.log(response)

      } catch (error) {
        console.error(error);
      }
      
    }

    const [amount, setAmount] = useState(0);
    const [interest, setInterest] = useState(0);
    const [duration, setDuration] = useState(0);
    const [nftShown, setNftShown] = useState(false);
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

        <Stack my='10vh' maxW='100vw' direction={['column', 'row']} spacing='6vw'>
          <Grid p={6} style={{overflowY: "scroll"}} minW='37vw' maxH='60vh' templateColumns='repeat(3, 1fr)' gap={6}>
            
            {
              props.tokens.map((token) => {
                console.log(token)
                return (
                  <Button onClick={() => {
                        setSelectedToken(token)
                        setNftShown(true)
                      }} minW='10vw' minH='8vw'>
                    <VStack>
                      <Image h='6vw' src={token.metadata.media} alt='Dan Abramov' />
                      <Text fontSize='0.7em'>{token.metadata.title}</Text>
                    </VStack>
                  </Button>
                )
              })
            }
            
          </Grid>
          <VStack minW='37vw' maxH='60vh'>
          <Skeleton isLoaded={nftShown}>
            <Image w='20vw' src={selectedToken.metadata.media} alt='Dan Abramov' />
            </Skeleton>
            <Skeleton isLoaded={nftShown}>
            <Text>{selectedToken.metadata.title}</Text>
            </Skeleton>
            <Stack spacing={4}>
            <Skeleton isLoaded={nftShown}>
              <InputGroup>
                <InputLeftAddon children='Loan Amount' />
                <Input type='number' onChange={handleChangeAmount}/>
                <InputRightAddon children='N' />
              </InputGroup>
              </Skeleton>
              <Skeleton isLoaded={nftShown}>
              <InputGroup>
                <InputLeftAddon children='Interest' />
                <Input type='number' onChange={handleChangeInterest}/>
                <InputRightAddon children='%' />
              </InputGroup>
              </Skeleton>
              <Skeleton isLoaded={nftShown}>
              <InputGroup>
                <InputLeftAddon children='Duration' />
                <Input type='number' onChange={handleChangeDuration}/>
                <InputRightAddon children='days' />
              </InputGroup>
              </Skeleton>
              <Skeleton isLoaded={nftShown}>
              <Button onClick={CreateLoanCallback}>Create Loan</Button>
              </Skeleton>
            </Stack>
          </VStack>
        </Stack>

  );
}

export default CreateLoan;
