<script lang="ts">
    import { closeEndpoint } from '@/api/network';
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import type { NavContext } from '@/router/types';
    import { toCssString } from '@/utils/cssHelpers';
    import { stringToColour } from '@/utils/stringToColor';
    import { Avatar, Button, Popover } from 'bits-ui';
    import { getContext } from 'svelte';

    const { authUser, unauthorize } = getContext<AuthContext>('authContext');
    const { navigateTo } = getContext<NavContext>('navContext');

    /** The user the dashboard is for. */
    const currentUser = $derived(authUser());

    // Styles for the avatar.
    let avatarButtonOpacity = $state(1.0);
    const avatarStyle = $derived(
        toCssString({
            backgroundColor: stringToColour(authUser()?.username ?? ''),
            borderRadius: '50%',
            width: '2.5em',
            height: '2.5em',
            justifyContent: 'center',
            textAlign: 'center',
            verticalAlign: 'middle',
            display: 'flex',
            alignItems: 'center',
            transform: 'translateX(-8em) translateY(-8em)',
            opacity: avatarButtonOpacity,
            transition: '0.2s',
        })
    );
    const avatarButtonStyle = toCssString({
        all: 'unset',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'inline-block',
    });

    /** Menu drawer style. */
    const menuDrawerStyle = toCssString({
        width: '75vw',
        height: '100vh',
        backdropFilter: 'blur(10px)',
        '-webkit-backdrop-filter': 'blur(10px)',
        backgroundColor: 'rgba(10, 3, 10, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderBottomRightRadius: '0.75em',
        borderTopRightRadius: '0.75em',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
    });

    /** Determines if currently in the process of running out. */
    let isLoggingOut = $state(false);

    /** Determines if the menu drawer should be displayed. */
    let displayMenuDrawer = $state(false);

    let menuDrawer = $state<HTMLElement>();

    /** Unauthenticates the user, closes the network endpoint and returns to the landing page. */
    async function logout() {
        isLoggingOut = true;
        await unauthorize();
        await closeEndpoint();
        await navigateTo('/', { replace: true });
    }
</script>

<!-- <Column spacing="30em" style="justify-content: center; align-items: center;"> -->
<Column spacing="30em">
    <Popover.Root>
        <!-- Avatar -->
        <Popover.Trigger
            style={avatarButtonStyle}
            onmouseenter={() => {
                if (!displayMenuDrawer) {
                    avatarButtonOpacity = 0.8;
                }
            }}
            onmouseleave={() => {
                if (!displayMenuDrawer) {
                    avatarButtonOpacity = 1.0;
                }
            }}
            onmousedown={() => {
                if (!displayMenuDrawer) {
                    avatarButtonOpacity = 0.5;
                }
            }}
            onmouseup={() => {
                if (!displayMenuDrawer) {
                    avatarButtonOpacity = 1.0;
                }
            }}
        >
            <Avatar.Root style={avatarStyle}>
                <Avatar.Fallback>
                    {currentUser && currentUser.username.length > 0
                        ? currentUser.username.charAt(0)
                        : ''}
                </Avatar.Fallback>
            </Avatar.Root>
            <!-- </Button.Root> -->
        </Popover.Trigger>

        <!-- Menu drawer -->
        <Popover.Content
            trapFocus={false}
            align="end"
            side="left"
            sideOffset={-150}
        >
            <div style={menuDrawerStyle} bind:this={menuDrawer}>Hi</div>
        </Popover.Content>
    </Popover.Root>

    <!-- Logout (TEMPORARY!) -->
    <Button.Root onclick={logout} disabled={isLoggingOut} style=":">
        {#if isLoggingOut}
            Logging out...
        {:else}
            Log out
        {/if}
    </Button.Root>
</Column>
