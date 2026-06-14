'use client';

import NextLink from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';
import MuiLink from '@mui/material/Link';
import { styled } from '@mui/material/styles';

const StyledLink = styled(MuiLink)({});

export default function SafeLink(props: NextLinkProps & { color?: string; children: React.ReactNode }) {
  return <StyledLink component={NextLink} {...props as any} />;
}
