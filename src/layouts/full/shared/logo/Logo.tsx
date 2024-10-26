import { FC } from 'react';
import { useSelector } from 'src/store/Store';
import { Link } from 'react-router-dom';
import LogoDark from 'src/assets/images/logos/logo_Dark.png';
import LogoDarkRTL from 'src/assets/images/logos/logo_Dark.png';
import LogoLight from 'src/assets/images/logos/logo.png';
import LogoLightRTL from 'src/assets/images/logos/logo.png';
import { styled } from '@mui/material';
import { AppState } from 'src/store/Store';

const Logo: FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? '40px' : '180px',
    overflow: 'hidden',
    display: 'block',
  }));

  // Determine which logo to use based on direction and mode
  let logoSrc;
  if (customizer.activeDir === 'ltr') {
    logoSrc = customizer.activeMode === 'dark' ? LogoDark : LogoLight;
  } else {
    logoSrc = customizer.activeMode === 'dark' ? LogoDarkRTL : LogoLightRTL;
  }

  return (
    <LinkStyled
      to="/"
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img src={logoSrc} alt="Logo" style={{ width: '100%', height: 'auto' }} />
    </LinkStyled>
  );
};

export default Logo;
