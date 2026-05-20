import LoadingButton from './LoadingButton';

// Wrapper fino: delega el estado loading al padre (modo controlado de LoadingButton)
export default function RefreshButton({
  onRefresh,
  isRefreshing,
  variant = 'outline',
}) {
  return (
    <LoadingButton
      variant={variant}
      loading={isRefreshing} // controlado
      onClick={onRefresh}
    >
      Actualizar
    </LoadingButton>
  );
}
