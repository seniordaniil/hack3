import styled from 'styled-components';

const Content = styled.div<{ height: string }>`
  padding-bottom: calc(
    ${({ height }) => height} + var(--safe-area-inset-bottom)
  );
`;

export default Content;
