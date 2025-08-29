import '@/components/banner/Banner.css';
import { GraphicEq } from '@mui/icons-material';
import { Icon, Stack } from '@mui/material';

export default function Banner() {
    return (
        <Stack className="banner" direction="row">
            <div className="stack-item">
                <Icon fontSize="large">
                    <GraphicEq fontSize="large"></GraphicEq>
                </Icon>
            </div>
            <div className="stack-item">
                <h2>Spots</h2>
            </div>
        </Stack>
    );
}
