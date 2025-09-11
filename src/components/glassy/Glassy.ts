import { StyledComponent } from '@emotion/styled';
import { styled } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export default function Glassy(
    component:
        | React.ComponentClass<any>
        | StyledComponent<any>
        | OverridableComponent<any>
) {
    return styled(component)({
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.01)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
    });
}
