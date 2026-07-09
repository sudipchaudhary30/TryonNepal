import os
import unittest

from app.api.routes import garments


class TestGarmentAssetPaths(unittest.TestCase):
    def test_upload_paths_use_public_clothes_storage(self):
        asset_dir = garments.get_garment_asset_dir()
        self.assertTrue(
            os.path.normpath(asset_dir).endswith(
                os.path.normpath(os.path.join('frontend', 'public', 'clothes', 'uploads'))
            )
        )
        self.assertTrue(os.path.isdir(asset_dir))

        asset_url = garments.get_garment_asset_url('example.png')
        self.assertTrue(asset_url.startswith('/clothes/uploads/'))

    def test_resolve_public_clothes_asset_path_supports_uploaded_files(self):
        uploaded_path = garments.resolve_garment_asset_path('/clothes/uploads/example.png')
        self.assertTrue(uploaded_path.endswith(os.path.join('frontend', 'public', 'clothes', 'uploads', 'example.png')))

        preloaded_path = garments.resolve_garment_asset_path('/clothes/himalayan_kurta.png')
        self.assertTrue(preloaded_path.endswith(os.path.join('frontend', 'public', 'clothes', 'himalayan_kurta.png')))


if __name__ == '__main__':
    unittest.main()
