import React from 'react';
import { connect } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import reverse from 'ramda/src/reverse';
import omit from 'ramda/src/omit';

import { modalClose } from '../../reducers/modal';
import Card from '../Card';
import { responsive } from '../../theme';

const fallDownIn = keyframes`
0% {
  opacity: 0;
  transform: translateY(-15px);
}
100% {
  opacity: 1;
  transform: translateY(0);
}
`;

const fallDownOut = keyframes`
0% {
  opacity: 1;
  transform: translateY(0px);
}
100% {
  opacity: 0;
  transform: translateY(15px);
}
`;

const Column = styled.div`
  ${({ modal }) =>
    modal
      ? `animation: ${fallDownIn} 0.4s forwards;`
      : `animation: ${fallDownOut} 0.4s forwards;`};
  position: relative;
  width: 100%;
  height: ${({ spanHeight }) => (spanHeight ? '100%' : 'auto')};
  max-width: ${({ maxWidth }) => `${maxWidth}px`};
  margin: 0 auto;
  padding-top: 10vh;
  padding-bottom: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ center }) => (center ? 'center' : 'flex-start')};
`;

const LightBox = styled.div`
  position: fixed;
  z-index: 10000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: scroll;
  transition: ${({ theme, animate }) =>
    animate ? theme.transitions.x_long : 'none'};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? 'auto' : 'none')};
  background: ${({ frontmost }) =>
    frontmost ? 'rgba(0, 0, 0, 0.7)' : 'transparent'};
`;

const Hitbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ModalCard = styled(Card)`
  overflow: visible;
  padding: 30px 26px;
  display: flex;
  flex-direction: column;
  @media screen and (${responsive.sm.max}) {
    padding: 15px;
    & h4 {
      margin: 20px auto;
    }
  }
`;

const CloseButton = styled(props => <div {...props}>&times;</div>)`
  font-family: tahoma;
  line-height: 21px;
  height: 28px;
  width: 28px;
  border-radius: 28px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.2);
  position: absolute;
  right: 12px;
  top: 12px;
  cursor: pointer;
  font-size: 22px;
  text-align: center;
`;

const Modal = props => {
  const {
    modal: ModalClass,
    visible,
    animate,
    modalClose,
    frontmost,
    ...otherProps
  } = props;
  if (!ModalClass) return null;

  const body = document.body || document.getElementsByTagName('body')[0];
  body.style.overflow = visible ? 'hidden' : 'auto';

  return (
    <LightBox visible={visible} frontmost={frontmost} animate={animate}>
      <Hitbox onClick={modalClose} />
      <Column maxWidth={600} modal={visible}>
        <ModalCard background="white">
          <CloseButton onClick={modalClose} />
          {ModalClass && <ModalClass {...otherProps} />}
        </ModalCard>
      </Column>
    </LightBox>
  );
};

const Modals = ({ stack, modalClose }) => {
  const size = stack.length;
  if (size === 0) return null;

  return reverse(stack).map((props, index) => (
    <Modal
      animate={size === 1}
      frontmost={
        // the second clause prevents the overlay from fading out and back in
        // when a modal closes and another modal below it is revealed
        index === size - 1 || (index === size - 2 && !stack[0].visible)
      }
      key={props.key}
      {...omit(['key'], props)}
      modalClose={modalClose}
    />
  ));
};

export default connect(
  state => ({ stack: state.modal.stack }),
  { modalClose }
)(Modals);
