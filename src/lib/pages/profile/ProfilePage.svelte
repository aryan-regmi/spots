<script lang="ts">
  import { Button } from 'bits-ui';
  import page, { type Callback } from 'page';
</script>

<div>
  <Button.Root onclick={() => page.show('/dashboard')}>Back</Button.Root>
</div>
