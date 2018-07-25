import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Intro from './Intro';
import Link from './Link';
import Transaction from '../shared/Transaction';
import Stepper from './Stepper';
import { getActiveAccount, getAccount } from '../../../reducers/accounts';
import {
  initiateLink,
  sendMkrToProxy,
  approveLink,
  clear as proxyClear,
  goToStep
} from '../../../reducers/proxy';
import { sendVote } from '../../../reducers/vote';
import { modalClose } from '../../../reducers/modal';
import Summary from './Summary';
import Lock from '../Lock';

class ProxySetup extends Component {
  componentDidMount() {
    this.props.proxyClear();
  }

  render() {
    return (
      <Fragment>
        <Stepper progress="1" /> {/* TODO */}
        {this.renderContent()}
        {this.props.mockGoToStep && (
          <a
            style={{
              position: 'absolute',
              fontSize: '8px'
            }}
            onClick={this.props.mockGoToStep}
          >
            Next step
          </a>
        )}
      </Fragment>
    );
  }

  renderContent() {
    const {
      confirming,
      setupProgress,
      modalClose,
      initiateLink,
      initiateLinkTxHash,
      activeAccount,
      accounts,
      network,
      coldAccount,
      hotAccount,
      approveLinkTxHash,
      sendMkrTxHash,
      sendMkrAmount,
      proxyClear,
      goToStep
    } = this.props;

    switch (setupProgress) {
      case undefined:
      case null:
        return (
          <Intro modalClose={modalClose} nextStep={() => goToStep('link')} />
        );
      case 'link':
        return (
          <Link
            initiateLink={initiateLink}
            activeAccount={activeAccount}
            accounts={accounts}
          />
        );
      case 'initiate':
        return (
          <Transaction
            confirming={confirming}
            network={network}
            txHash={initiateLinkTxHash}
            account={coldAccount}
          />
        );
      case 'approve':
        return (
          <Transaction
            confirming={confirming}
            network={network}
            txHash={approveLinkTxHash}
            account={hotAccount}
          />
        );
      case 'lockInput':
        return <Lock reset={false} />;
      case 'lock':
        return (
          <Transaction
            confirming={confirming}
            network={network}
            txHash={sendMkrTxHash}
            account={coldAccount}
          />
        );
      case 'summary':
        return <Summary {...{ modalClose, proxyClear, sendMkrAmount }} />;
    }
  }
}

ProxySetup.propTypes = {
  sendMkrToProxy: PropTypes.func.isRequired,
  initiateLinkTxHash: PropTypes.string,
  approveLinkTxHash: PropTypes.string,
  sendMkrTxHash: PropTypes.string
};

ProxySetup.defaultProps = {
  initiateLinkTxHash: '',
  approveLinkTxHash: '',
  sendMkrTxHash: ''
};

// flip this if you want to step through the setup steps without actually
// making any changes
let mock = false;

const fakeColdAccount = {
  address: '0xbeefed1bedded2dabbed3defaced4decade5babe',
  type: 'TREZOR',
  proxyRole: 'cold',
  mkrBalance: 456
};

const fakeHotAccount = {
  address: '0xbeefed1bedded2dabbed3defaced4decade5babe',
  type: 'METAMASK',
  proxyRole: 'hot',
  mkrBalance: 123
};

const stateProps = state => {
  const {
    modal,
    metamask,
    accounts,
    proxy: {
      initiateLinkTxHash,
      approveLinkTxHash,
      sendMkrTxHash,
      sendMkrAmount,
      confirmingInitiate,
      confirmingApprove,
      confirmingSendMkr,
      hotAddress,
      coldAddress,
      setupProgress
    }
  } = state;

  let props = {
    modal: modal.modal,
    modalProps: modal.modalProps,
    account: metamask.accountAddress,
    accounts: accounts.allAccounts,
    activeAccount: getActiveAccount({ accounts }),
    network: metamask.network === 'kovan' ? 'kovan' : 'mainnet',
    initiateLinkTxHash,
    sendMkrTxHash,
    sendMkrAmount,
    approveLinkTxHash,
    confirming: confirmingInitiate || confirmingApprove || confirmingSendMkr,
    hotAccount: getAccount(state, hotAddress),
    coldAccount: getAccount(state, coldAddress),
    setupProgress
  };

  if (mock) {
    props = {
      ...props,
      hotAccount: fakeHotAccount,
      coldAccount: fakeColdAccount,
      sendMkrAmount: 789
    };
  }

  return props;
};

const dispatchProps = {
  modalClose,
  initiateLink,
  approveLink,
  sendMkrToProxy,
  sendVote,
  proxyClear,
  goToStep
};

if (mock) {
  dispatchProps.mockGoToStep = () => ({ type: 'MOCK_NEXT_STEP' });
}

export default connect(
  stateProps,
  dispatchProps
)(ProxySetup);
