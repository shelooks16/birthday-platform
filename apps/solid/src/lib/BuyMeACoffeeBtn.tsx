import { appConfig } from '../appConfig';

const BuyMeACoffeeBtn = () => {
  return (
    <a
      href={`https://www.buymeacoffee.com/${appConfig.developerInfo.buyMeACoffe?.id}`}
      target="_blank"
      style={{ display: 'inline-block' }}
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
        alt="Buy Me A Coffee"
        width="170px"
        height="auto"
        style={{
          width: '170px',
          height: 'auto'
        }}
      />
    </a>
  );
};
export default BuyMeACoffeeBtn;
