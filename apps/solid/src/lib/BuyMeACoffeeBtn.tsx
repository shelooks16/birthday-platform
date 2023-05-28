import { Show } from 'solid-js';
import { appConfig } from '../appConfig';

const BuyMeACoffeeBtn = () => {
  return (
    <Show when={appConfig.developerInfo.buyMeACoffe.id}>
      <a
        href={`https://www.buymeacoffee.com/${appConfig.developerInfo.buyMeACoffe.id}`}
        target="_blank"
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
          alt="Buy Me A Coffee"
          style={{
            width: '178px'
          }}
        />
      </a>
    </Show>
  );
};
export default BuyMeACoffeeBtn;
