import styled from "@emotion/styled";

const LinkButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  font-weight: bold;
  font-size: 20px;
  text-decoration: none;
  line-height: 1;

  &:hover {
    text-decoration: underline !important;
  }
`;

export default LinkButton;
