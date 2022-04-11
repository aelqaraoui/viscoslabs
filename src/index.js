import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { initContract } from './utils'

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <StrictMode>
        <ColorModeScript />
        <App />
      </StrictMode>,
      document.getElementById('root')
    )
  })
  .catch(console.error)