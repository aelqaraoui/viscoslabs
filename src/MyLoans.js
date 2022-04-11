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
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons'
import './App.css'

import * as nearAPI from "near-api-js";

import MyListings from './MyListings';
import OngoingLoans from './OngoingLoans';

function MyLoans() {

  return (

    <Box w='100%' h='10' my='5vw'>
        <Tabs isFitted variant='enclosed'>
        <TabList mb='1em'>
            <Tab>My Listings</Tab>
            <Tab>Ongoing Loans</Tab>
        </TabList>
        <TabPanels>
            <TabPanel>
                <MyListings />
            </TabPanel>
            <TabPanel>
                <OngoingLoans />
            </TabPanel>
        </TabPanels>
        </Tabs>
    </Box>

  );
}

export default MyLoans;