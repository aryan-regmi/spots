import { GraphicEq } from '@mui/icons-material';
import { Icon, Stack, styled } from '@mui/material';

const StyledStack = styled(Stack)({
    gap: '0.3em',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.25em',
    height: 'auto',
    flexShrink: 1,
    padding: '1em 0',
    maxHeight: '1.75em',
    backgroundColor: '#407021',
    borderRadius: '0.5em',
});

export default function Banner() {
    return (
        <StyledStack direction="row">
            <div>
                <Icon fontSize="large">
                    <GraphicEq fontSize="large"></GraphicEq>
                </Icon>
            </div>
            <div>
                <h2>Spots</h2>
            </div>
        </StyledStack>
    );
}
