<script lang="ts">
    import type { AuthContext } from '@/auth/types';
    import Column from '@/components/Column.svelte';
    import Row from '@/components/Row.svelte';
    import { toCssString } from '@/utils/cssHelpers';
    import { stringToColour } from '@/utils/stringToColor';
    import { Avatar, Button, Popover, Separator } from 'bits-ui';
    import { getContext } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';

    const { authUser } = getContext<AuthContext>('authContext');

    /** The user the dashboard is for. */
    const currentUser = $derived(authUser());

    // Styles for the avatar.
    let buttonOpacity = $state(1.0);
    const baseAvatarStyle = $derived({
        backgroundColor: stringToColour(authUser()?.username ?? ''),
        borderRadius: '50%',
        width: '2.5em',
        height: '2.5em',
        justifyContent: 'center',
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'flex',
        alignItems: 'center',
    });
    const triggerAvatarStyle = $derived(
        toCssString({
            ...baseAvatarStyle,
            transform: 'translateX(-8em) translateY(-8em)',
            opacity: buttonOpacity,
            transition: '0.2s',
        })
    );
    const avatarButtonStyle = toCssString({
        all: 'unset',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'inline-block',
    });

    /** Determines if the menu drawer should be displayed. */
    let displayMenuDrawer = $state(false);

    let menuDrawer = $state<HTMLElement>();

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

    const menuContainerStyle = toCssString({
        padding: '3em 2em',
    });
</script>

<Popover.Root bind:open={displayMenuDrawer}>
    <!-- Avatar -->
    <Popover.Trigger
        style={avatarButtonStyle}
        onmouseenter={() => {
            if (!displayMenuDrawer) {
                buttonOpacity = 0.8;
            }
        }}
        onmouseleave={() => {
            if (!displayMenuDrawer) {
                buttonOpacity = 1.0;
            }
        }}
        onmousedown={() => {
            if (!displayMenuDrawer) {
                buttonOpacity = 0.5;
            }
        }}
        onmouseup={() => {
            if (!displayMenuDrawer) {
                buttonOpacity = 1.0;
            }
        }}
    >
        <Avatar.Root style={triggerAvatarStyle}>
            <Avatar.Fallback>
                {currentUser && currentUser.username.length > 0
                    ? currentUser.username.charAt(0)
                    : ''}
            </Avatar.Fallback>
        </Avatar.Root>
    </Popover.Trigger>

    <!-- Menu drawer -->
    <Popover.Content
        trapFocus={false}
        align="end"
        side="left"
        sideOffset={-150}
        forceMount
    >
        {#snippet child({ wrapperProps, props, open })}
            {#if open}
                <div {...wrapperProps}>
                    <div
                        {...props}
                        in:fly={{ duration: 150, x: '-300' }}
                        out:fade={{ duration: 300 }}
                    >
                        <div style={menuDrawerStyle} bind:this={menuDrawer}>
                            <Column style={menuContainerStyle}>
                                <Button.Root
                                    style="all: unset; cursor: pointer; padding: 0; margin: 0; text-align: left; opacity: {buttonOpacity};"
                                    onmouseenter={() => {
                                        buttonOpacity = 0.8;
                                    }}
                                    onmouseleave={() => {
                                        buttonOpacity = 1.0;
                                    }}
                                >
                                    <Row
                                        spacing="0.5em"
                                        style="align-items: center; padding-bottom: 0; margin-bottom: 0;"
                                    >
                                        <Avatar.Root style={baseAvatarStyle}>
                                            <Avatar.Fallback>
                                                {currentUser &&
                                                currentUser.username.length > 0
                                                    ? currentUser.username.charAt(
                                                          0
                                                      )
                                                    : ''}
                                            </Avatar.Fallback>
                                        </Avatar.Root>

                                        <h3>{currentUser?.username}</h3>
                                    </Row>
                                    <span
                                        style="font-size: 0.7em; padding: 0; margin: 0; margin-top: -3em; text-align: left; padding-top: 0.25em; padding-left: 1em; color: darkgray;"
                                        >View Profile</span
                                    >
                                </Button.Root>
                                <div
                                    class="divider"
                                    style={`border-top: 1px solid white; margin: 0;`}
                                ></div>
                            </Column>
                        </div>
                    </div>
                </div>
            {/if}
        {/snippet}
    </Popover.Content>
</Popover.Root>
