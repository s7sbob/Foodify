import { Helmet } from 'react-helmet';

type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
};

const PageContainer = ({ description, children }: Props) => (
  <div>
    <Helmet>
      <title>Foodify</title> {/* Set a fixed title */}
      {description && <meta name="description" content={description} />}
    </Helmet>
    {children}
  </div>
);

export default PageContainer;
