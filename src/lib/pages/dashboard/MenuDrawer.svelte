<script lang="ts">
  import Column from '@/components/ui/Column.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import Row from '@/components/ui/Row.svelte';
  import SignOut from 'phosphor-svelte/lib/SignOut';
  import Spinner from '@/components/ui/Spinner.svelte';
  import { Avatar, NavigationMenu, Popover } from 'bits-ui';
  import { authContextKey } from '@/auth/authContextKey';
  import { closeEndpoint } from '@/api/network';
  import { fly } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { navContextKey } from '@/router/navContextKey';
  import { stringToColour } from '@/utils/stringToColor';
  import { toCssString } from '@/utils/cssHelpers';
  import { type AuthContext } from '@/auth/types';
  import { type NavContext } from '@/router/types';

  const { authUser, unauthorize } = getContext<AuthContext>(authContextKey);
  const { navigateTo } = getContext<NavContext>(navContextKey);

  // TODO: Make this a prop
  //
  /** The menu options. */
  const menuItems = $state([
    {
      label: 'Log out',
      icon: SignOut,
      opacity: 1,
      onclick: logout,
    },
  ]);

  /** The user the dashboard is for. */
  const currentUser = $derived(authUser());

  /** Opacity for the buttons. */
  let buttonOpacities = $state({
    trigger: 1.0,
    header: 1.0,
  });

  /** Determines if the menu drawer should be displayed. */
  let displayMenuDrawer = $state(false);

  /** The actual element for the drawer. */
  let menuDrawer = $state<HTMLElement>();

  /** Determines if the user is being logged out. */
  let isLoggingOut = $state(false);

  $effect(() => {
    if (displayMenuDrawer) {
      buttonOpacities.trigger = 0;
    }
  });

  /** Unauthenticates the user, closes the network endpoint and returns to the landing page. */
  async function logout() {
    isLoggingOut = true;
    await unauthorize();
    await closeEndpoint();
    navigateTo('/login', { replace: true });
  }

  /** Styles for the avatar. */
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
  const triggerAvatarDisplay = $derived.by(() => {
    if (displayMenuDrawer) {
      return 'hidden';
    } else {
      return 'visible';
    }
  });
  const triggerAvatarStyle = $derived(
    toCssString({
      all: 'unset',
      transform: 'translateX(-8em) translateY(-8em)',
      cursor: 'pointer',
      opacity: buttonOpacities.trigger,
      transition: '0.2s',
      visibility: triggerAvatarDisplay,
    })
  );

  /** Styles for the header. */
  const headerStyles = $state({
    row: toCssString({
      alignItems: 'center',
      paddingBottom: 0,
      marginBottom: '-0.5em',
    }),
    viewProfile: toCssString({
      fontSize: '0.7em',
      margin: 0,
      padding: 0,
      paddingRight: '3em',
      paddingLeft: '1em',
      color: 'darkgray',
      textAlign: 'left',
    }),
    divider: toCssString({
      borderTop: '1px solid white',
      margin: 0,
      paddingBottom: '1em',
    }),
  });

  /** Styles for the menu drawer. */
  const drawerStyles = {
    base: toCssString({
      width: '75vw',
      height: '100vh',
      backdropFilter: 'blur(10px)',
      '-webkit-backdrop-filter': 'blur(10px)',
      backgroundColor: 'rgba(50, 30, 50, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      borderBottomRightRadius: '0.75em',
      borderTopRightRadius: '0.75em',
      justifyContent: 'center',
      alignItems: 'center',
      userSelect: 'none',
    }),
    list: toCssString({
      listStyleType: 'none',
      alignItems: 'left',
      justifyContent: 'left',
      textAlign: 'left',
      margin: 0,
      padding: 0,
    }),
    button: toCssString({
      width: '100%',
      textAlign: 'left',
      backgroundColor: 'inherit',
      border: 'none',
      borderBottom: `1px solid rgba(50, 50, 50, 0.8)`,
      outline: 'none',
      borderRadius: '0.1em',
      paddingBottom: '0.5em',
    }),
    row: toCssString({
      verticalAlign: 'middle',
      justifyContent: 'left',
      alignItems: 'center',
    }),
  };
</script>

{#if isLoggingOut}
  <div class="logout-container">
    <div class="spinner-content">
      Logging out...
      <Spinner />
    </div>
  </div>
{:else}
  <Popover.Root bind:open={displayMenuDrawer}>
    <!-- Avatar -->
    <Popover.Trigger
      style={triggerAvatarStyle}
      onmouseenter={() => (buttonOpacities.trigger = 0.5)}
      onmouseleave={() => (buttonOpacities.trigger = 1.0)}
      onmouseup={() => (buttonOpacities.trigger = 0.5)}
      onmousedown={() => (buttonOpacities.trigger = 1.0)}
      onclick={() => (buttonOpacities.trigger = 0.0)}
    >
      <Avatar.Root style={baseAvatarStyle}>
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
      sideOffset={-100}
      forceMount
      onclose={() => (buttonOpacities.trigger = 1.0)}
    >
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div {...props} transition:fly={{ duration: 150, x: '-300' }}>
              <div style={drawerStyles.base} bind:this={menuDrawer}>
                <Column style="padding: 3em 2em;">
                  <!-- Header -->
                  <IconButton onclick={() => navigateTo('/profile')}>
                    <Column>
                      <Row spacing="0.5em" style={headerStyles.row}>
                        <Avatar.Root style={baseAvatarStyle}>
                          <Avatar.Fallback>
                            {currentUser && currentUser.username.length > 0
                              ? currentUser.username.charAt(0)
                              : ''}
                          </Avatar.Fallback>
                        </Avatar.Root>

                        <h3>{currentUser?.username}</h3>
                      </Row>
                      <span style={headerStyles.viewProfile}>View Profile</span>
                    </Column>
                  </IconButton>
                  <div class="divider" style={headerStyles.divider}></div>

                  <!-- Menu Items -->
                  <NavigationMenu.Root orientation="vertical">
                    <NavigationMenu.List style={drawerStyles.list}>
                      {#each menuItems as menuItem}
                        <NavigationMenu.Item openOnHover={false}>
                          <IconButton
                            onclick={menuItem.onclick}
                            style={drawerStyles.button}
                          >
                            <Row spacing="0.5em" style={drawerStyles.row}>
                              {@const Component = menuItem.icon}
                              <Component font-size="1.5em" />
                              Log out
                            </Row>
                          </IconButton>
                        </NavigationMenu.Item>
                      {/each}
                    </NavigationMenu.List>
                  </NavigationMenu.Root>
                </Column>
              </div>
            </div>
          </div>
        {/if}
      {/snippet}
    </Popover.Content>
  </Popover.Root>
{/if}

<style>
  .logout-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .spinner-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    gap: 1em;
  }
</style>
