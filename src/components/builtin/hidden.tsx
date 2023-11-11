export const Hidden = ({
  when,
  loading = null,
  children,
}: {
  children: any;
  loading?: React.ReactElement | null;
  when: boolean;
}) => {
  return when ? loading : children;
};

export default Hidden;

export const Visible = ({
  when,
  otherwise = null,
  children,
}: {
  children: any;
  otherwise?: React.ReactElement | null;
  when: boolean;
}) => {
  return when ? children : otherwise;
};
