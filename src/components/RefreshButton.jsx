import LoadingButton from './LoadingButton';

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
